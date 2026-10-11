# Traza de módulos (para continuar en otro chat)

Índice operativo. La fuente funcional sigue siendo `docs/REQUERIMIENTOS.md`.
Un archivo por módulo (`11_feature_docs_standard.md`, ADR-005). **No** se escribe un `.md` por cada cambio: se actualiza el doc del módulo al cerrarlo y este índice.

## Cómo reanudar

1. Cargar, en este orden: `AGENTS.md`, `docs/REQUERIMIENTOS.md`, `docs/prompts/1` a `4` y `5`, `docs/architecture.md`, `docs/ui-kit.md`, este archivo y el `docs/features/<modulo>.md` del último módulo listo.
2. **Node:** el predeterminado del nvm de esta máquina es **18**. El repo exige **22** (`.nvmrc`). Antes de lint/test/dev: `nvm use 22` (hoy está instalado `22.23.3`). Con Node 18, Vitest no carga `vitest.config.ts`.
3. No reescribir los módulos ya listos. No ejecutar git salvo que lo pidan en ese turno.
4. Responder en español (Colombia).

## Prompt para pegar en el siguiente chat

```text
Continúa CASA en el módulo 4 (perfiles y catálogo de beneficios). No reescribas los módulos 0, 1, 2 ni 3.

Antes de implementar, carga en este orden:
AGENTS.md, docs/REQUERIMIENTOS.md, docs/prompts/1_project_context.md,
docs/prompts/2_architecture_rules.md, docs/prompts/3_development_workflow.md,
docs/prompts/4_documentation_workflow.md, docs/prompts/5_feature_generator.md,
docs/architecture.md, docs/ui-kit.md, docs/features/README.md,
docs/features/users.md.

Node: nvm use 22 (el default de la máquina es 18). Sin git salvo que lo pida
en el mismo turno. Responde en español (Colombia).

Construye el módulo 4 completo según REQUERIMIENTOS §8.6 (catálogo, no la
entrega), §9.8–§9.9, §10.6 (solo el catálogo), §10.7 y §13: /perfiles y
/beneficios (hoy son ModulePlaceholder). API: /api/profiles y /api/benefits.
No borres perfiles ni beneficios: se desactivan. El perfil inactivo no se
asigna a afiliados nuevos. El anual queda con máximo 1. La entrega, la
excepción y la anulación son el módulo 7: no las abras.
Kit: DatatableLocal, shared/ui/mui, ConfirmRecordActionModal, AppDialog.
Sin fórmulas nuevas en src/rules: la cuota del perfil usa las que ya existen.

Al cerrar: lint + test en Node 22, docs/features/profiles.md (y benefits si
hace falta) y actualizar este README. El módulo 3 quedó listo en código;
no lo reabras salvo un bug.
```

## Estado

| # | Módulo | Doc | Estado |
|---|---|---|---|
| 0 | Base (Prisma, semilla, sesión, login, menú) | [base.md](./base.md) | Listo y commiteado |
| 1 | Reglas (`src/rules`) | [rules.md](./rules.md) | Listo y commiteado |
| 2 | Parámetros y medios de pago | [settings.md](./settings.md) | Listo y en `origin/jact` (`1a79e46`) |
| 3 | Usuarios y roles | [users.md](./users.md) | Listo (código + pruebas). Sin commit. Recorrido UI con sesión pendiente |
| 4 | Perfiles y beneficios (catálogo) | — | **Siguiente** |
| 5 | Afiliados | — | Pendiente |
| 6 | Cuotas y pagos | — | Pendiente |
| 7 | Entregas | — | Pendiente |
| 8 | Inicio | — | Pendiente |
| 9 | Página pública | — | Pendiente |

Commit que cierra 0+1 (rama `jact`): `Cerrar base y reglas: sesión propia y fórmulas de cuota.`
El módulo 2 está en `origin/jact` en `1a79e46`. El módulo 3 aún no está en git hasta que lo pidan.

## Qué no tocar

- Módulo 0: Prisma, `0001_init`, semilla, `/api/auth/*`, cookie `casa_session`, `/login`, `/cambiar-clave`, `middleware.ts`, menú por permisos.
- Módulo 1: `src/rules/{money,calendar,fees,benefits}.ts` y sus pruebas.
- Módulo 2: `src/server/modules/settings`, `src/features/settings`, `/api/settings`, `/api/payment-methods`, `/parametros`.
- Módulo 3: `src/server/modules/users`, `src/server/modules/roles`, `src/features/users`, `src/features/roles`, `/api/users`, `/api/roles`, `/api/permissions`, `/usuarios`, `/roles`. Solo un bug o el recorrido con sesión.

## Módulo 3 — archivos (cerrado)

```
src/server/modules/users/        schema, repository, service + pruebas
src/server/modules/roles/        schema, repository, service + pruebas
src/app/api/users/route.ts
src/app/api/users/[id]/route.ts
src/app/api/roles/route.ts
src/app/api/roles/[id]/route.ts
src/app/api/permissions/route.ts
src/features/users/              data → domain → viewmodel → view
src/features/roles/              data → domain → viewmodel → view
src/app/(panel)/usuarios/page.tsx
src/app/(panel)/roles/page.tsx
```

Permisos: `users.view` / `users.manage` y `roles.view` / `roles.manage`. El operativo no los tiene.
Sin migración. La clave no sale de la API. Al asignarla, `mustChangePassword = true`.

## Deuda conocida (no bloquea el módulo 4)

- Recorrido de `/usuarios`, `/roles` y `/parametros` con sesión: sin cookie el panel cae en `/login`. Falta sembrar o definir `ADMIN_EMAIL` / `ADMIN_PASSWORD` en `.env.local` si el ingreso sigue en 400. El navegador embebido usa `http://127.0.0.1:4200`.
- Dev a veces ya está en el puerto 4200 (`EADDRINUSE`): no levantar otro.

## Módulo 4 — punto de partida

- Rutas: `/perfiles`, `/beneficios` (hoy son `ModulePlaceholder`). Las entregas (`/beneficios/entregas`) son el módulo 7.
- API: `/api/profiles`, `/api/benefits` (§5.5). No hay borrado físico.
- Modelos ya en Prisma: `MembershipProfile`, `Benefit`, `ProfileBenefit`. Sin migración nueva salvo que el esquema no alcance.
- Perfil: nombre, porcentaje (> 0 y ≤ 100), activo, beneficios del catálogo. La cuota mostrada es la plena con el SMMLV actual (`quoteFullFee`). El inactivo no se asigna a afiliados nuevos.
- Beneficio: campos de §9.9. Anual: `maxDeliveriesPerYear` siempre 1. Eventual: 1 a 12. `isPublic` exige texto público.
- Permisos: `profiles.view` / `profiles.manage`, `benefits.view` / `benefits.manage`. El operativo ve perfiles y no administra el catálogo.
- Kit: `DatatableLocal`, `shared/ui/mui`, `ConfirmRecordActionModal`, `AppDialog`.
- No hay reglas nuevas en `src/rules`.

## Comandos

```bat
nvm use 22
npm test
npm run lint
npm run dev
```

Dev en el puerto **4200**. Base: rama `dev` de Neon vía `.env.local`. Nunca migrar ni escribir contra producción.
