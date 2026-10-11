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
Continúa CASA en el módulo 6 (cuotas y pagos). No reescribas los módulos 0 a 5.

Antes de implementar, carga en este orden:
AGENTS.md, docs/REQUERIMIENTOS.md, docs/prompts/1_project_context.md,
docs/prompts/2_architecture_rules.md, docs/prompts/3_development_workflow.md,
docs/prompts/4_documentation_workflow.md, docs/prompts/5_feature_generator.md,
docs/architecture.md, docs/ui-kit.md, docs/features/README.md,
docs/features/members.md.

Node: nvm use 22 (el default de la máquina es 18). Sin git salvo que lo pida
en el mismo turno. Responde en español (Colombia).

Construye el módulo 6 completo según REQUERIMIENTOS §8.1, §8.2, §8.3, §5.6,
§10.5, §12.2, §12.3 y §13: ensureFeesUpToDate, cron GET /api/cron/fees,
/pagos (hoy es ModulePlaceholder), POST /api/fees/pay y
POST /api/fees/[id]/revert. La cuota que se guarda la calcula el servidor
con src/rules. No abras /beneficios/entregas.

Al cerrar: lint + test en Node 22, docs/features/fees.md y actualizar este
README. El módulo 5 quedó cerrado en jact; no lo reabras salvo un bug.
```

## Estado

| # | Módulo | Doc | Estado |
|---|---|---|---|
| 0 | Base (Prisma, semilla, sesión, login, menú) | [base.md](./base.md) | Listo y commiteado |
| 1 | Reglas (`src/rules`) | [rules.md](./rules.md) | Listo y commiteado |
| 2 | Parámetros y medios de pago | [settings.md](./settings.md) | Listo y en `origin/jact` (`1a79e46`) |
| 3 | Usuarios y roles | [users.md](./users.md) | Listo y en `origin/jact` (`47fc5e8`) |
| 4 | Perfiles y catálogo de beneficios | [profiles.md](./profiles.md) | Listo y en `jact`. Recorrido UI con sesión pendiente |
| 5 | Afiliados | [members.md](./members.md) | Listo en `jact`. Recorrido UI con sesión pendiente |
| 6 | Cuotas y pagos | — | **Siguiente** |
| 7 | Entregas | — | Pendiente |
| 8 | Inicio | — | Pendiente |
| 9 | Página pública | — | Pendiente |

Commit que cierra 0+1 (rama `jact`): `Cerrar base y reglas: sesión propia y fórmulas de cuota.`
El módulo 2 está en `origin/jact` en `1a79e46`. El módulo 3 está en `47fc5e8`. El módulo 4 cierra en `12a4157`. El módulo 5 cierra en este trabajo, rama `jact`.

## Qué no tocar

- Módulo 0: Prisma, `0001_init`, semilla, `/api/auth/*`, cookie `casa_session`, `/login`, `/cambiar-clave`, `middleware.ts`, menú por permisos.
- Módulo 1: `src/rules/{money,calendar,fees,benefits}.ts` y sus pruebas.
- Módulo 2: `src/server/modules/settings`, `src/features/settings`, `/api/settings`, `/api/payment-methods`, `/parametros`.
- Módulo 3: `src/server/modules/users`, `src/server/modules/roles`, `src/features/users`, `src/features/roles`, `/api/users`, `/api/roles`, `/api/permissions`, `/usuarios`, `/roles`.
- Módulo 4: `src/server/modules/profiles`, `src/server/modules/benefits`, `src/features/profiles`, `src/features/benefits`, `/api/profiles`, `/api/benefits`, `/perfiles`, `/beneficios`. `/beneficios/entregas` sigue en el módulo 7.
- Módulo 5: `src/server/modules/members`, `src/features/members`, `/api/members`, `/api/members/[id]`, `/afiliados`.

## Módulo 5 — archivos (cerrado)

```
src/server/modules/members/      schema, repository, service + pruebas
src/app/api/members/route.ts
src/app/api/members/[id]/route.ts
src/features/members/            data → domain → viewmodel → view
src/app/(panel)/afiliados/page.tsx
```

Permisos: `members.view` / `members.create` / `members.edit`. El operativo los tiene.
Alta en transacción: número, cuota del mes y, si aplica, cuota de ingreso. SMMLV en 0 → 409.
Sin migración. Sin borrado físico.

## Deuda conocida (no bloquea el módulo 6)

- Recorrido con sesión de `/afiliados`, `/perfiles`, `/beneficios`, `/usuarios`, `/roles` y `/parametros`: sin cookie el panel cae en `/login`. `GET /api/members` responde 401. El navegador embebido usa `http://127.0.0.1:4200`.
- Dev a veces ya está en el puerto 4200 (`EADDRINUSE`): no levantar otro.

## Módulo 6 — punto de partida

- Ruta: `/pagos` (hoy es `ModulePlaceholder`).
- API: `GET /api/fees`, `POST /api/fees/pay`, `POST /api/fees/[id]/revert`, cron `GET /api/cron/fees`.
- Servicio compartido `ensureFeesUpToDate(today)`: cuota del mes para activos y paso a Moroso. También lo llaman `GET /api/dashboard`, `GET /api/fees` y `GET /api/members/[id]`.
- Kit: `DatatableLocal`, `shared/ui/mui`, `AppDialog`. La cuota y el recargo que se guardan los calcula el servidor con `src/rules`.

## Comandos

```bat
nvm use 22
npm test
npm run lint
npm run dev
```

Dev en el puerto **4200**. Base: rama `dev` de Neon vía `.env.local`. Nunca migrar ni escribir contra producción.
