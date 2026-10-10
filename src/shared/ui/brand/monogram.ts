/** Up to two uppercase initials from a product name ("Gestión Operativa" -> "GO"). */
export function toMonogram(name: string, override?: string): string {
  const source = (override ?? "").trim();
  if (source) return source.slice(0, 2).toUpperCase();

  const words = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);

  if (words.length === 0) return "A";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Normalizes files in /public to a root-relative path; leaves absolute and data URLs untouched. */
export function resolveAssetUrl(path: string): string {
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return path.startsWith("/") ? path : `/${path}`;
}
