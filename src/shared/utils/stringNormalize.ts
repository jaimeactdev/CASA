/**
 * Normaliza texto para búsquedas: minúsculas y sin diacríticos.
 * Ej.: "Publicación" → "publicacion", "Sí" → "si"
 */
export function normalizeForSearch(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/** Indica si `haystack` contiene `needle` ignorando mayúsculas y acentos. */
export function includesNormalized(haystack: unknown, needle: unknown): boolean {
  const h = normalizeForSearch(haystack);
  const n = normalizeForSearch(needle);
  if (!n) return true;
  return h.includes(n);
}

/** Igualdad ignorando mayúsculas y acentos. */
export function equalsNormalized(a: unknown, b: unknown): boolean {
  return normalizeForSearch(a) === normalizeForSearch(b);
}
