function readPath(source: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = source;
  for (const key of path) {
    if (!current || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[key];
  }
  return current ?? null;
}

export type InsumoFaltanteRow = {
  nombre: string;
  id: string;
  categoria: string;
  periodo: string;
};

export type ApiErrorTable = {
  summary: string;
  rows: InsumoFaltanteRow[];
};

const INSUMO_FALTANTE_HEADER_REGEX = /^Insumos faltantes\s*\(\d+\):/i;
const INSUMO_FALTANTE_ITEM_REGEX =
  /'([^']+)'\s*\(id=(\d+),\s*categoria='([^']+)',\s*período\s*([^)]+)\)/g;

/** Parsea mensajes del API con insumos faltantes separados por `|`. */
export function parseInsumosFaltantesMessage(
  text: string,
): ApiErrorTable | null {
  const trimmed = String(text ?? "").trim();
  if (!INSUMO_FALTANTE_HEADER_REGEX.test(trimmed)) return null;

  const summaryMatch = trimmed.match(/^(Insumos faltantes\s*\(\d+\):)/i);
  const summary = summaryMatch?.[1] ?? "Insumos faltantes:";

  const rows: InsumoFaltanteRow[] = [];
  const itemRegex = new RegExp(INSUMO_FALTANTE_ITEM_REGEX.source, "g");
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(trimmed)) !== null) {
    rows.push({
      nombre: match[1],
      id: match[2],
      categoria: match[3],
      periodo: match[4].trim(),
    });
  }

  if (!rows.length) return null;
  return { summary, rows };
}

function tryParseInsumosFaltantesFromTexts(
  texts: string[],
): ApiErrorTable | null {
  for (const text of texts) {
    const parsed = parseInsumosFaltantesMessage(text);
    if (parsed) return parsed;
  }
  return null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Extrae líneas de texto desde `errors` del API (string[] u objetos). */
export function collectApiErrorLines(errors: unknown): string[] {
  if (!Array.isArray(errors)) return [];
  return errors
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        return String(
          o.message ?? o.error ?? o.detalle ?? o.Error ?? o.Message ?? "",
        ).trim();
      }
      return "";
    })
    .filter(Boolean);
}

export function extractApiErrorPayload(
  source: unknown,
): Record<string, unknown> | null {
  if (!source || typeof source !== "object") return null;
  const record = source as Record<string, unknown>;
  const nested = readPath(record, ["response", "data"]);
  if (nested && typeof nested === "object") {
    return nested as Record<string, unknown>;
  }
  if ("errors" in record || "message" in record || "success" in record) {
    return record;
  }
  const inner = readPath(record, ["data"]);
  if (
    inner &&
    typeof inner === "object" &&
    ("errors" in (inner as object) || "message" in (inner as object))
  ) {
    return inner as Record<string, unknown>;
  }
  return null;
}

export function formatApiErrorLinesHtml(errors: unknown): string {
  const lines = collectApiErrorLines(errors);
  if (!lines.length) return "";
  return lines.map((line) => `• ${escapeHtml(line)}`).join("<br/>");
}

/** Obtiene líneas de error desde payload API, UnifiedError o throw del backend. */
export function resolveApiErrorLines(
  source: unknown,
  payload: Record<string, unknown> | null,
): string[] {
  const candidates: unknown[] = [];

  if (payload) {
    candidates.push(payload.errors, payload.Errors);
  }
  if (source && typeof source === "object") {
    const record = source as Record<string, unknown>;
    candidates.push(
      record.errors,
      record.Errors,
      record.errorLines,
      record.ErrorLines,
    );
  }

  for (const candidate of candidates) {
    const lines = collectApiErrorLines(candidate);
    if (lines.length) return lines;
  }

  return [];
}

/** Título, descripción y líneas para el modal de error. */
export function formatApiErrorForToast(
  source: unknown,
  fallbackTitle = "Error",
  fallbackDescription = "Ocurrió un error inesperado",
): {
  title: string;
  description: string;
  errorLines?: string[];
  errorTable?: ApiErrorTable;
} {
  const payload = extractApiErrorPayload(source);
  const errorLines = resolveApiErrorLines(source, payload);

  const message = payload
    ? String(payload.message ?? "").trim()
    : source &&
        typeof source === "object" &&
        "message" in (source as object)
      ? String((source as { message?: string }).message ?? "").trim()
      : "";

  const errorTable = tryParseInsumosFaltantesFromTexts(
    [...errorLines, message].filter(Boolean),
  );
  if (errorTable) {
    return {
      title: "Insumos faltantes",
      description: errorTable.summary,
      errorTable,
    };
  }

  if (errorLines.length) {
    return {
      title: message || fallbackTitle,
      description: "",
      errorLines,
    };
  }

  if (!payload) {
    return {
      title: fallbackTitle,
      description: message || fallbackDescription,
    };
  }

  return {
    title: message || fallbackTitle,
    description: message || fallbackDescription,
  };
}

/** Mensaje unificado (p. ej. callbacks `onError` del BaseController). */
export function formatApiErrorMessage(
  source: unknown,
  fallback = "Ocurrió un error inesperado",
): string {
  const { title, description } = formatApiErrorForToast(
    source,
    fallback,
    fallback,
  );
  if (title === description) return title;
  if (description.includes("<br/>")) {
    return title !== fallback ? `${title}<br/><br/>${description}` : description;
  }
  return description;
}
