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
Continúa CASA en el módulo 8 (inicio). No reescribas los módulos 0 a 7.

Antes de implementar, carga en este orden:
AGENTS.md, docs/REQUERIMIENTOS.md, docs/prompts/1_project_context.md,
docs/prompts/2_architecture_rules.md, docs/prompts/3_development_workflow.md,
docs/prompts/4_documentation_workflow.md, docs/prompts/5_feature_generator.md,
docs/architecture.md, docs/ui-kit.md, docs/features/README.md,
docs/features/deliveries.md.

Node: nvm use 22 (el default de la máquina es 18). Sin git salvo que lo pida
en el mismo turno. Responde en español (Colombia).

El módulo 6 sigue cerrado en a0b7bf1. El módulo 7 quedó cerrado en 699abb9
(entregas y menú: no se expande al pasar el cursor; Beneficios navega a
/beneficios y la flecha abre Entregas). No reabras los módulos 0 a 7 salvo
un bug.

Construye el módulo 8 completo según REQUERIMIENTOS §10.3 y §13:
/home (hoy puede ser placeholder) y GET /api/dashboard. Conteos de afiliados
activos, activos en mora, cuotas pendientes del mes y morosas de cualquier
periodo. Aviso si el SMMLV está en 0. Recordatorio si el mes coincide con el
suggestedMonth de un beneficio activo. Accesos a afiliados, pagos y entregas
según permisos. GET /api/dashboard debe llamar ensureFeesUpToDate. No abras
la página pública.

Al cerrar: lint + test en Node 22, el documento del módulo según
11_feature_docs_standard.md y actualizar este README.
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
| 6 | Cuotas y pagos | [fees.md](./fees.md) | Cerrado en `a0b7bf1`. Recorrido UI con sesión pendiente |
| 7 | Entregas | [deliveries.md](./deliveries.md) | Cerrado en `699abb9`. Recorrido UI con sesión pendiente |
| 8 | Inicio | — | **Siguiente** |
| 9 | Página pública | — | Pendiente |

Commit que cierra 0+1 (rama `jact`): `Cerrar base y reglas: sesión propia y fórmulas de cuota.`
El módulo 2 está en `origin/jact` en `1a79e46`. El módulo 3 está en `47fc5e8`. El módulo 4 cierra en `12a4157`. El módulo 5 cierra en `ab45f24`. El módulo 6 queda cerrado en `a0b7bf1`, rama `jact`. El módulo 7 cierra en `699abb9`.

## Qué no tocar

- Módulo 0: Prisma, `0001_init`, semilla, `/api/auth/*`, cookie `casa_session`, `/login`, `/cambiar-clave`, `middleware.ts` (salvo el paso de `/api/cron/fees`, que ya valida `CRON_SECRET` en la ruta), menú por permisos. El menú no se expande al pasar el cursor. Beneficios navega a `/beneficios`; la flecha abre Entregas.
- Módulo 1: `src/rules/{money,calendar,fees,benefits}.ts` y sus pruebas.
- Módulo 2: `src/server/modules/settings`, `src/features/settings`, `/api/settings`, `/api/payment-methods`, `/parametros`.
- Módulo 3: `src/server/modules/users`, `src/server/modules/roles`, `src/features/users`, `src/features/roles`, `/api/users`, `/api/roles`, `/api/permissions`, `/usuarios`, `/roles`.
- Módulo 4: `src/server/modules/profiles`, `src/server/modules/benefits`, `src/features/profiles`, `src/features/benefits`, `/api/profiles`, `/api/benefits`, `/perfiles`, `/beneficios`. `/beneficios/entregas` sigue en el módulo 7.
- Módulo 5: `src/server/modules/members`, `src/features/members`, `/api/members`, `/afiliados`. `GET /api/members/[id]` ya llama `ensureFeesUpToDate`; no reabrir la ficha salvo un bug.
- Módulo 6: `src/server/modules/fees`, `src/features/fees`, `/api/fees`, `/api/cron/fees`, `/pagos`, `vercel.json`.
- Módulo 7: `src/server/modules/deliveries`, `src/features/deliveries`, `/api/benefit-deliveries`, `GET /api/members/[id]/benefits`, `/beneficios/entregas`. En la ficha solo se sumó la evaluación y «Registrar entrega».

## Módulo 6 — archivos (cerrado)

```
src/server/modules/fees/         schema, repository, service + pruebas
src/app/api/fees/route.ts
src/app/api/fees/pay/route.ts
src/app/api/fees/[id]/revert/route.ts
src/app/api/cron/fees/route.ts
src/features/fees/               data → domain → viewmodel → view
src/app/(panel)/pagos/page.tsx
vercel.json                      cron 10 5 * * *
```

Permisos: `fees.view` / `fees.pay` / `fees.revert`. El operativo los tiene.
`ensureFeesUpToDate` lo llaman el cron, `GET /api/fees`, `GET /api/members/[id]` y `GET /api/members/[id]/benefits`.
`GET /api/dashboard` (módulo 8) debe llamarlo también. Sin migración. Sin borrado físico.

## Deuda conocida (no bloquea el módulo 8)

- Recorrido con sesión de `/beneficios/entregas`, `/pagos`, `/afiliados`, `/perfiles`, `/beneficios`, `/usuarios`, `/roles` y `/parametros`: sin cookie el panel cae en `/login`. `GET /api/benefit-deliveries` y `GET /api/fees` responden 401. El navegador embebido usa `http://127.0.0.1:4200`.
- Dev a veces ya está en el puerto 4200 (`EADDRINUSE`): no levantar otro.

## Módulo 7 — archivos (listo)

```
src/server/modules/deliveries/   schema, repository, service + pruebas
src/app/api/benefit-deliveries/route.ts
src/app/api/benefit-deliveries/[id]/void/route.ts
src/app/api/members/[id]/benefits/route.ts
src/features/deliveries/         data → domain → viewmodel → view
src/app/(panel)/beneficios/entregas/page.tsx
```

Permisos: `benefits.view` / `benefits.deliver` / `benefits.deliver_exception` / `benefits.void_delivery`. El operativo tiene ver y entregar, no la excepción ni la anulación.
La evaluación sale de `evaluateBenefit`. Sin migración. Sin borrado físico.
`GET /api/dashboard` (módulo 8) debe llamar `ensureFeesUpToDate`, igual que la ficha y el listado de cuotas.

## Módulo 8 — punto de partida

- Ruta: `/home`.
- API: `GET /api/dashboard` con sesión. Conteos y recordatorios de §10.3.
- Debe llamar `ensureFeesUpToDate` antes de responder.
- No abrir la página pública.

## Comandos

```bat
nvm use 22
npm test
npm run lint
npm run dev
```

Dev en el puerto **4200**. Base: rama `dev` de Neon vía `.env.local`. Nunca migrar ni escribir contra producción.
