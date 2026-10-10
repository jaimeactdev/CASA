# Identidad de CASA

La identidad pasa por `appConfig` y variables de entorno. No hay nombres de
producto escritos en el código.

## 1. Identidad

| Campo | Dónde | Valor |
|-------|--------|---------|
| Nombre corto | `NEXT_PUBLIC_APP_NAME` o `src/config/appConfig.ts` | `CASA` |
| Nombre completo | `NEXT_PUBLIC_APP_FULL_NAME` | `Círculo de Apoyo y Servicios para Afiliados` |
| Tagline login | `NEXT_PUBLIC_APP_TAGLINE` | `Gestión de afiliados, pagos y beneficios` |
| Descripción SEO | `NEXT_PUBLIC_APP_DESCRIPTION` | `Beneficios y servicios para afiliados en Medellín.` |
| URL pública | `NEXT_PUBLIC_SITE_URL` | URL de Vercel o dominio propio |

El paquete npm se llama `casa`.

## 2. Logos (opcional)

La plantilla no trae logos de ninguna marca. Sin configuración, `BrandLogo`
genera un **monograma** con las iniciales de `NEXT_PUBLIC_APP_NAME` en el color
primario (sidebar, sidebar colapsado y login).

Para usar logos propios, copia los archivos a `public/` (sugerido: `public/brand/`)
y declara las rutas en `.env.local`:

| Variable | Uso | Si está vacía |
|----------|-----|---------------|
| `NEXT_PUBLIC_LOGO_FULL` | Sidebar expandido | Monograma + nombre |
| `NEXT_PUBLIC_LOGO_MARK` | Sidebar colapsado (cuadrado) | Monograma |
| `NEXT_PUBLIC_LOGO_LOGIN` | Pantalla de login | Usa `LOGO_FULL` o el monograma |
| `NEXT_PUBLIC_FAVICON` | Ícono de la pestaña | `src/app/favicon.ico` |
| `NEXT_PUBLIC_APP_MONOGRAM` | Iniciales del monograma (máx. 2) | Iniciales del nombre |

Aceptan rutas de `public/` (`/brand/logo.svg`) o URLs absolutas. El logo se ve
sobre fondo blanco: usa la variante a color, con fondo transparente.

## 3. Colores de marca

Un solo parámetro en `.env.local`, **entre comillas** (sin comillas el `#` se
lee como comentario y se usa el color por defecto):

```
NEXT_PUBLIC_BRAND_COLOR="#1E5631"
```

A partir de ese valor `src/styles/brandColor.ts` deriva `brandPress`, `brandBg`,
`brandTint` y las sombras. `designTokens`, `palette.ts` y las variables CSS
(`--color-primary`, `--color-brand-*`, inyectadas en `<html>`) lo leen solos:
no hay que editar archivos de estilo. Reinicia `npm run dev` tras cambiarlo.

El shell (header, sidebar, fondo) usa los neutros de `chrome` en
`designTokens.ts`; el primario solo aparece como acento. Forma de botones,
radios y campos: **[docs/ui-kit.md](./ui-kit.md)**.

El verde bosque `#1E5631` es el valor por defecto: si la variable falta, la app
se ve igual. Derivados: `brandPress` `#1A4A2A` y `brandBg` `#E9EEEA`.

## 3.1 Íconos

- Header y acciones genéricas: `src/config/appIcons.ts` (cambia la entrada por
  otro ícono de `@mui/icons-material` o un SVG propio).
- Menú: propiedad `icon` de cada ítem en `src/shared/layouts/menuItems.ts`.

## 4. Checklist rápido

- [x] `appConfig` / env de identidad
- [x] `package.json` name
- [x] `NEXT_PUBLIC_BRAND_COLOR` entre comillas
- [ ] Logos en `public/brand/` + `NEXT_PUBLIC_LOGO_*` (o dejar el monograma)
- [ ] Favicon (`NEXT_PUBLIC_FAVICON` o `src/app/favicon.ico`)
- [ ] Íconos del header en `src/config/appIcons.ts` si aplica
- [ ] Mismas variables `NEXT_PUBLIC_*` en el panel de Vercel
- [ ] Menú (`src/shared/layouts/menuItems.ts`)
