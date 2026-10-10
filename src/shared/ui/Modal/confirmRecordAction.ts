export type RecordSummaryField = {
  label: string;
  value: string;
};

export type ConfirmRecordAction = "inactivate" | "activate" | "approve";

export type RecordIdentitySummary = {
  /** Línea principal (nombre, código, variable, etc.). */
  title: string;
  /** Líneas secundarias cortas (Id, Estado…). */
  details: string[];
};

type ColumnLike = {
  field?: string | number | symbol;
  header?: unknown;
  headerName?: unknown;
};

const TITLE_FIELD_KEYS = [
  "nombre",
  "name",
  "codigo",
  "codigoNombre",
  "descripcion",
  "variableNombre",
  "numeroContrato",
  "clienteNombre",
  "titulo",
  "label",
  "razonSocial",
  "nodoNombre",
  "expresionNombre",
];

const DETAIL_FIELD_KEYS = ["id", "estadoDisplay", "estado"];

function headerToLabel(col: ColumnLike): string {
  const raw = col.header ?? col.headerName;
  if (raw == null || raw === false) return "";
  if (typeof raw === "string" || typeof raw === "number") return String(raw).trim();
  return "";
}

function valueToDisplay(value: unknown): string {
  if (value == null) return "";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value).trim();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleString("es-CO");
  }
  return "";
}

function readRowValue(
  row: Record<string, unknown>,
  fieldKey: string,
): string {
  return valueToDisplay(row[fieldKey]);
}

/**
 * Resumen corto e identificable del registro (para modales de confirmación).
 * Evita listados densos: título + 1–2 detalles.
 */
export function buildRecordIdentitySummary(
  row: Record<string, unknown> | null | undefined,
  columns?: ColumnLike[] | null,
): RecordIdentitySummary | null {
  if (!row) return null;

  const columnFields =
    columns
      ?.map((col) => {
        const field = col.field == null ? "" : String(col.field).trim();
        if (!field || field === "acciones" || field === "actions") return null;
        const value = readRowValue(row, field);
        if (!value) return null;
        return { field, label: headerToLabel(col) || field, value };
      })
      .filter((it): it is { field: string; label: string; value: string } => it != null) ??
    [];

  const byField = new Map(columnFields.map((it) => [it.field, it]));

  let title = "";
  for (const key of TITLE_FIELD_KEYS) {
    const fromCol = byField.get(key)?.value;
    const fromRow = readRowValue(row, key);
    const value = fromCol || fromRow;
    if (value) {
      title = value;
      break;
    }
  }

  if (!title) {
    const firstMeaningful = columnFields.find(
      (it) => !DETAIL_FIELD_KEYS.includes(it.field),
    );
    title = firstMeaningful?.value || readRowValue(row, "id") || "";
  }

  if (!title) return null;

  const details: string[] = [];
  const idValue = byField.get("id")?.value || readRowValue(row, "id");
  if (idValue && idValue !== title) {
    details.push(`Id ${idValue}`);
  }

  const estado =
    byField.get("estadoDisplay")?.value ||
    readRowValue(row, "estadoDisplay") ||
    byField.get("estado")?.value ||
    readRowValue(row, "estado");
  if (estado && estado !== title) {
    details.push(estado);
  }

  return { title, details: details.slice(0, 2) };
}

/**
 * @deprecated Preferir `buildRecordIdentitySummary`. Se mantiene por compatibilidad.
 */
export function buildRecordSummaryFields(
  row: Record<string, unknown> | null | undefined,
  columns: ColumnLike[] | null | undefined,
): RecordSummaryField[] {
  const identity = buildRecordIdentitySummary(row, columns);
  if (!identity) return [];
  const fields: RecordSummaryField[] = [{ label: "Registro", value: identity.title }];
  identity.details.forEach((detail, index) => {
    fields.push({ label: index === 0 ? "Detalle" : "Estado", value: detail });
  });
  return fields;
}

export function confirmRecordActionMessage(action: ConfirmRecordAction): string {
  if (action === "activate") return "¿Realmente desea activar el registro?";
  if (action === "approve") return "¿Realmente desea aprobar el registro?";
  return "¿Realmente desea inactivar el registro?";
}

export function confirmRecordActionButtonText(action: ConfirmRecordAction): string {
  if (action === "activate") return "Sí, activar";
  if (action === "approve") return "Sí, aprobar";
  return "Sí, inactivar";
}
