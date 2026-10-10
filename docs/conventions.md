# Convenciones

Alineadas con el código existente. Si un módulo ya tiene una variación válida,
mantener consistencia **dentro** de ese módulo; no inventar un tercer estilo.

Reglas prescriptivas: `docs/prompts/2_architecture_rules.md`.

---

## Idioma

- UI visible (labels, toasts, menú, errores al usuario): **español**.
- Código (carpetas, componentes, hooks, tipos, comentarios, logs técnicos): **inglés**.
- No usar español en identificadores (`validateUser`, no `validarUsuario`). El copy de pantalla sigue en español.

## Naming

| Qué | Patrón | Ejemplo |
|-----|--------|---------|
| Feature (carpeta) | `kebab` o sustantivo corto | `login`, `form` |
| View | `PascalCase` + sufijo `View`/`Page` | `EjemploView`, `LoginPage` |
| ViewModel | hook `use<Nombre>ViewModel` | `useLoginViewModel` |
| Domain service | `<Nombre>Service` | `LoginService` |
| Repository | `<Nombre>Repository` | `LoginRepository` |
| Componente MUI shared | `<Nombre>FieldMUI` / `HoverIconButton` | `InputFieldMUI` |
| Página App Router | `page.tsx` delgada | `app/(panel)/afiliados/page.tsx` |
| Estilos de botón | `theme.customButtons.<variante>` | `primary`, `secondary` |
| Módulo de servidor | `src/server/modules/<modulo>/<modulo>.<capa>.ts` | `members.service.ts` |
| Route Handler | `src/app/api/<recurso en inglés>/route.ts` | `api/members/[id]/route.ts` |
| Regla pura | `src/rules/<area>.ts` + `<area>.test.ts` | `fees.ts` |
| Permiso | `<modulo>.<accion>` en inglés | `fees.pay` |
| Modelo Prisma | `PascalCase` singular; tablas en `snake_case` con `@@map` | `Member` → `members` |

Archivos nuevos: **sin espacios ni sufijos “ - original” / “ - para build”**.
Esos archivos existentes son copias de trabajo, no plantillas.

## Features

Estructura obligatoria:

```
src/features/<nombre>/
  data/repositories/<Nombre>Repository.ts
  domain/<nombre>Service.ts          # + tipos si hacen falta
  viewmodel/use<Nombre>ViewModel.ts
  view/<Nombre>View.tsx
```

- La view solo importa el viewmodel y `shared` / `styles` / `config`.
- El viewmodel no llama a Axios ni a `httpRequestProvider`.
- El domain no tiene JSX.
- El repository no tiene `useState` ni navegación.

Alta de ruta:

1. `src/app/(panel)/<ruta>/page.tsx` → monta la view + `seoMetadata`.
2. `src/shared/layouts/menuItems.ts` (con el permiso que habilita el ítem)
3. `src/shared/router/breadcrumbs.ts` (si hay migas)
4. `src/core/seo/seoMetadata.ts`

## Estado de catálogos (UI)

- En esta plantilla, menú y filas usan `'A'` activo, `'I'` inactivo.
- Menú: `status: "A" | "I" | "R"` (`R` = requiere sesión).
- Confirmaciones de fila: `ConfirmRecordAction` (`activar` / `inactivar` / …).
- El mapeo desde un payload remoto a estos valores ocurre **solo** en `data/`.

## Integración con `/api`

- I/O del cliente solo en repositorios (`data/`). View, viewmodel y domain no conocen URLs, headers ni el protocolo.
- Cliente HTTP: `httpRequestProvider` (desde `data/`). No crear Axios (ni otro cliente) en la view.
- URL base: `ENV.BACKEND.URL_BASE`, que vale `/api` (mismo dominio, la cookie viaja sola).
- Errores: la API responde `{ message, errors? }`. El cliente lanza excepciones con `message` y el viewmodel las traduce a toast o estado de form.
- Códigos: 400 validación o credenciales, 401 sin sesión, 403 sin permiso, 404 no existe, 409 conflicto (duplicado, ya pagada).
- Credenciales y tokens: solo en la cookie HttpOnly `casa_session`. Nunca en `localStorage` ni en la UI.

## Servidor

- Todo archivo de `src/server` empieza con `import 'server-only'`.
- `route.ts`: `requirePermission` → `schema.parse` → servicio → `Response.json`.
- Montos en pesos enteros (`Int`). Porcentajes en `Decimal(6,2)`. Fechas de negocio calculadas en `America/Bogota`.
- Fechas en JSON: `YYYY-MM-DD` para días, ISO 8601 para instantes.

## Estilos

1. Tokens: `src/styles/designTokens.ts` (`colors`, `chrome`, `fontSizes`, `fontWeights`, `iconSizes`). Tamaños de letra e íconos salen de ahí, no de `px` sueltos.
2. Variantes de componente: `theme.customButtons`, `theme.customStyleForm`, etc.
3. `sx` local solo para layout (flex, gap, margin), no para reinventar el botón.
4. Ver `docs/ui-kit.md` — radio y color no se improvisan.

## Imports

Alias `@/` = `src/`. No usar `../../../` para salir de un feature hacia core/shared.

```ts
import { colors } from '@/styles/designTokens';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import httpRequestProvider from '@/core/network/httpRequestProvider';
```

## Client vs Server

- Views, viewmodels, layouts con hooks: `'use client'`.
- `page.tsx` puede ser Server Component si solo monta la view y exporta metadata
  (patrón de `ejemplo/page.tsx`).

## Secretos

- Nunca versionar `.env.local` ni tokens.
- Identidad pública: `NEXT_PUBLIC_APP_*` y `appConfig`.
- Base de datos, `AUTH_SECRET`, `CRON_SECRET` y clave del administrador: sin prefijo `NEXT_PUBLIC_`. `.env.example` documenta nombres, no valores reales.

## Git / commits (cuando el usuario lo pida)

- Título y cuerpo en español, verbo en infinitivo, ≤ 72 caracteres en el resumen.
- El asistente **no** ejecuta git salvo instrucción explícita en ese turno.
