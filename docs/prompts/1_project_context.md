# PROJECT CONTEXT — MAPA OPERATIVO (CASA)

## Identidad del sistema
- CASA — Círculo de Apoyo y Servicios para Afiliados. Gestión de afiliados por ventanilla, cuotas, mora y beneficios de una asociación en Medellín.
- Lo usan dos personas del personal. El afiliado no entra al sistema.
- Fuente funcional: `docs/REQUERIMIENTOS.md`.
- Stack: Next.js 15 App Router (monolito en Vercel), React 19, TypeScript, MUI 7, PrimeReact, Zustand, TanStack Query, Prisma + PostgreSQL (Neon), Zod, Vitest, Playwright.
- Arquitectura: frontend por features MVVM, Route Handlers en `src/app/api`, servicios en `src/server`, reglas puras en `src/rules` (ver `docs/architecture.md` y `docs/decisions/`).

## Coordenadas del repositorio

```
prisma/              schema, migraciones, semilla
src/middleware.ts    sesión obligatoria en el panel
src/app              páginas delgadas, (panel) con shell, api/ con Route Handlers
src/features         frontend por módulo (MVVM)
src/rules            fórmulas de cuota, recargo y beneficios (puras, con pruebas)
src/server           Prisma, sesión, permisos, servicios por módulo (server-only)
src/core             HTTP del cliente, guards, stores, excepciones, SEO
src/shared           UI kit, layouts, hooks, utils
src/styles           tokens + theme MUI
src/config           appConfig (identidad)
docs/                requerimientos, ADR, arquitectura, UI kit, prompts
```

Features actuales:
- `login`: correo y clave contra `/api/auth/*` (el servidor llega con el módulo 0).
- `home`: inicio del panel.
- `form`: formulario de ejemplo del kit.
- `ejemplo`: esqueleto para copiar.

Orden de módulos: `docs/REQUERIMIENTOS.md`, sección 13.

## Naming conventions

Fuente: `docs/conventions.md`.

- **Frontend:** `MembersView`, `useMembersViewModel`, `MembersService`, `MembersRepository`.
- **Servidor:** `members.schema.ts`, `members.repository.ts`, `members.service.ts`.
- **Modelos Prisma:** `Member`, `Fee`, `Benefit`… (glosario en `REQUERIMIENTOS.md`).
- **Permisos:** `<modulo>.<accion>`, en inglés (`fees.pay`).
- **Rutas de pantalla:** en español (`/afiliados`). Rutas de API en inglés (`/api/members`).

## Localización (UI)

- Copy al usuario en español (Colombia).
- Código, comentarios e identificadores en inglés.
- Activo / inactivo de catálogos: `'A'` / `'I'` en la UI. Los estados de negocio usan sus enums (`ACTIVE`, `PENDING`, …).
- Menú: `status` `A` (visible sin sesión), `I` (oculto), `R` (requiere sesión). El módulo 0 agrega `permission` a `MenuItem` para ocultar lo que el rol no puede usar.

## Patrones ya presentes (mantener)

- MVVM por feature (`data` / `domain` / `viewmodel` / `view`).
- Páginas App Router delgadas.
- I/O del cliente solo en repositorios, con `HttpRequestProvider` contra `/api`.
- `AuthGuard` + `SessionBinder` en el cliente. La seguridad real está en `middleware.ts` y en cada `route.ts`.
- Theme MUI extendido (`customButtons`, `customStyleForm`, layouts).
- Datatable PrimeReact para listados de negocio.
- `AppDialog` para modales (sin cierre por backdrop).
- `HoverIconButton` + `customButtons` para CTA (píldora 44px).
- Campos `shared/ui/mui` (radio 20px, alto 45px).

## Shell y rutas

- Layout con shell: `app/(panel)/layout.tsx` (header + menú + migas).
- `/login` y `/cambiar-clave`: sin shell, fondo primario.
- `/`: página pública, sin shell.
- Rutas del panel y permisos: `docs/REQUERIMIENTOS.md`, sección 5.4.

## Pruebas

- Unitarias con Vitest (`npm test`): todo `src/rules`, servicios con reglas, `resolveAuthGate`, `LoginService`, menú, `FormService`, marca.
- E2E con Playwright (`npm run test:e2e`): login, sesión, F5, logout y shell, con la API de sesión simulada.

## Referencias rápidas
- Requerimientos: `docs/REQUERIMIENTOS.md`
- Decisiones: `docs/decisions/`
- Arquitectura: `docs/architecture.md`
- UI kit (color, radio, botones): `docs/ui-kit.md`
- Componentes: `docs/shared-components.md`
- Convenciones: `docs/conventions.md`
- Branding: `docs/BRANDING.md`
- Timeout de sesión: `docs/session-timeout-implementation.md`
