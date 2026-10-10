/** Zona horaria de negocio (Colombia; sin DST). */
export const COLOMBIA_TIME_ZONE = "America/Bogota";

const COLOMBIA_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: COLOMBIA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
};

/**
 * Parsea fechas/horas del API. El backend persiste con `DateTime.UtcNow` y a menudo
 * serializa ISO sin `Z`; esas se interpretan como UTC. Formatos `dd/MM/yyyy` se
 * tratan como calendario/hora de Colombia.
 */
export function parseApiDateTime(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const s = String(value).trim();
  if (!s) return null;

  const dmy = s.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    const hour = Number(dmy[4] ?? 0);
    const minute = Number(dmy[5] ?? 0);
    const second = Number(dmy[6] ?? 0);
    // Colombia = UTC-5 fijo: expresar reloj de Bogotá como instante UTC.
    const d = new Date(
      Date.UTC(year, month - 1, day, hour + 5, minute, second),
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // ISO / SQL (`yyyy-MM-dd[ T]HH:mm[:ss]`) sin zona → UTC (UtcNow del backend).
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const normalized = s.includes("T") ? s : s.replace(" ", "T");
    const withZ = /[zZ]$/.test(normalized) ? normalized : `${normalized}Z`;
    const d = new Date(withZ);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";

  // Solo fecha calendario (sin hora): no convertir zona para no correr el día.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    const [year, month, day] = dateStr.trim().split("-");
    return `${day}/${month}/${year}`;
  }

  const date = parseApiDateTime(dateStr);
  if (!date) return dateStr;

  return date.toLocaleDateString("es-CO", {
    timeZone: COLOMBIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/** Fecha y hora siempre en zona Colombia (`America/Bogota`, UTC-5). */
export function formatDateTime(value: unknown): string {
  if (value == null) return "";
  const raw = String(value).trim();
  if (!raw) return "";

  const date = parseApiDateTime(raw);
  if (!date) return raw;

  return date.toLocaleString("es-CO", COLOMBIA_DATE_TIME_OPTIONS);
}

export function formatDateForPayload(dateString: string): string {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
}

/**
 * Convierte fechas del formulario (`dd/MM/yyyy`), ISO del API u otros formatos a `yyyy-MM-dd`
 * para query params y payloads que el backend deserializa como `DateOnly`.
 */
export function toApiDateOnly(raw: string | undefined | null): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const dd = m[1].padStart(2, "0");
    const mm = m[2].padStart(2, "0");
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

/** Fecha actual en formato `yyyy-MM-dd` (zona local del navegador). */
export function todayAsApiDateOnly(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatYYYYMMDDToDDMMYYYY(dateStr: string): string {
    if (!dateStr) return '';
    // Verifica si viene en formato YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const [year, month, day] = parts;
        // Tomamos solo la parte de la fecha si viene con hora (T...)
        const cleanDay = day.split('T')[0];
        return `${cleanDay}/${month}/${year}`;
    }
    // Si no coincide con el formato esperado, intenta usar formatDate normal
    return formatDate(dateStr);
}

/** Año mínimo para fechas operativas / de negocio (no nacimiento u otras abiertas). */
export const BUSINESS_DATE_MIN_YEAR = 2000;

/** Años hacia el futuro permitidos desde el año actual. */
export const BUSINESS_DATE_MAX_YEAR_OFFSET = 10;

/** Límite inferior ISO (`yyyy-MM-dd`) para fechas de negocio. */
export function getBusinessDateMinIso(): string {
  return `${BUSINESS_DATE_MIN_YEAR}-01-01`;
}

/** Límite superior ISO (`yyyy-MM-dd`): 31-dic del año actual + offset. */
export function getBusinessDateMaxIso(): string {
  const maxYear = new Date().getFullYear() + BUSINESS_DATE_MAX_YEAR_OFFSET;
  return `${maxYear}-12-31`;
}

/**
 * Resuelve min/max para inputs de fecha de negocio.
 * Si `restrictYearRange` es false, solo aplica los overrides explícitos.
 */
export function resolveBusinessDateBounds(options?: {
  minDate?: string;
  maxDate?: string;
  restrictYearRange?: boolean;
}): { min?: string; max?: string } {
  const restrict = options?.restrictYearRange !== false;
  if (!restrict) {
    return {
      min: options?.minDate,
      max: options?.maxDate,
    };
  }
  return {
    min: options?.minDate ?? getBusinessDateMinIso(),
    max: options?.maxDate ?? getBusinessDateMaxIso(),
  };
}

function isoToDdMmYyyy(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

/** Texto de ayuda con el rango permitido (dinámico). */
export function getBusinessDateRangeHintMessage(options?: {
  minDate?: string;
  maxDate?: string;
  restrictYearRange?: boolean;
}): string | undefined {
  const { min, max } = resolveBusinessDateBounds(options);
  if (!min && !max) return undefined;
  if (min && max) {
    return `Solo se permiten fechas entre el ${isoToDdMmYyyy(min)} y el ${isoToDdMmYyyy(max)}.`;
  }
  if (min) return `La fecha no puede ser anterior al ${isoToDdMmYyyy(min)}.`;
  return `La fecha no puede ser posterior al ${isoToDdMmYyyy(max!)}.`;
}

/**
 * Validador reutilizable.
 * Acepta `dd/MM/yyyy` o `yyyy-MM-dd`. Vacío = válido (usar `required` aparte).
 */
export function validateBusinessDateRange(
  value: unknown,
  options?: {
    minDate?: string;
    maxDate?: string;
    restrictYearRange?: boolean;
  },
): true | string {
  if (value == null || String(value).trim() === "") return true;

  const iso = toApiDateOnly(String(value));
  if (!iso) return true;

  const { min, max } = resolveBusinessDateBounds(options);
  if (min && iso < min) {
    return `La fecha no puede ser anterior al ${isoToDdMmYyyy(min)}.`;
  }
  if (max && iso > max) {
    return `La fecha no puede ser posterior al ${isoToDdMmYyyy(max)}.`;
  }
  return true;
}

/**
 * Variante para `rules.validate` de react-hook-form (solo recibe el value del campo).
 * No pasar `validateBusinessDateRange` directamente: su 2.º parámetro de opciones
 * choca con el de formValues de RHF.
 */
export function validateBusinessDateRangeValue(value: unknown): true | string {
  return validateBusinessDateRange(value);
}
