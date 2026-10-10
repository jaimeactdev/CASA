// src/shared/router/breadcrumbs.ts

export const breadcrumbsByRoute: Record<
  string,
  { label: string; parent?: string }
> = {
  "/": { label: "Inicio" },
  "/home/": { label: "Inicio", parent: "/" },
  "/ejemplo/": { label: "Ejemplo", parent: "/" },
  "/form/": { label: "Formulario", parent: "/" },
};
