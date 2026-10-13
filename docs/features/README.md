# Traza de módulos (para continuar en otro chat)

Índice operativo. La fuente funcional sigue siendo `docs/REQUERIMIENTOS.md`.
Un archivo por módulo (`11_feature_docs_standard.md`, ADR-005). **No** se escribe un `.md` por cada cambio: se actualiza el doc del módulo al cerrarlo y este índice.

## Cómo reanudar

1. Cargar, en este orden: `AGENTS.md`, `docs/REQUERIMIENTOS.md`, `docs/prompts/1` a `4` y `5`, `docs/architecture.md`, `docs/ui-kit.md`, este archivo y el `docs/features/<modulo>.md` del módulo que vayas a construir o revisar.
2. **Node:** el predeterminado del nvm de esta máquina es **18**. El repo exige **22** (`.nvmrc`). Antes de lint/test/dev: `nvm use 22` (hoy está instalado `22.23.3`). Con Node 18, Vitest no carga `vitest.config.ts`.
3. No reescribir los módulos ya listos. No ejecutar git salvo que lo pidan en ese turno.
4. Responder en español (Colombia).

## Prompt para pegar en el siguiente chat

```text
Continúa CASA en el módulo 10 (formulario de afiliación PDF). No reescribas
los módulos 0 a 9 salvo un bug.

Antes de tocar código, carga en este orden:
AGENTS.md, docs/REQUERIMIENTOS.md, docs/prompts/1_project_context.md,
docs/prompts/2_architecture_rules.md, docs/prompts/3_development_workflow.md,
docs/prompts/4_documentation_workflow.md, docs/architecture.md, docs/ui-kit.md,
docs/features/README.md y docs/features/affiliation-form.md.

Node: nvm use 22 (el default de la máquina es 18). Sin git salvo que lo pida
en el mismo turno. Responde en español (Colombia).

El módulo 9 está en origin/jact. El módulo 10 está especificado en
REQUERIMIENTOS §5.8 y §10.11 y en affiliation-form.md: PDF descargable desde
/ y /login, campos del alta, autorización de datos según la Ley 1581 de 2012
y el Decreto 1377 de 2013 (casilla sin marcar), firmas con representante
legal para menores y declaraciones. La asociación no reporta a centrales de
riesgo. No crea afiliados. El recorrido con sesión del panel sigue pendiente.
```

## Estado

| # | Módulo | Doc | Estado |
|---|---|---|---|
| 0 | Base (Prisma, semilla, sesión, login, menú) | [base.md](./base.md) | Listo y commiteado |
| 1 | Reglas (`src/rules`) | [rules.md](./rules.md) | Listo y commiteado |
| 2 | Parámetros y medios de pago | [settings.md](./settings.md) | Listo y en `origin/jact` (`1a79e46`) |
| 3 | Usuarios y roles | [users.md](./users.md) | Listo y en `origin/jact` (`47fc5e8`) |
| 4 | Perfiles y catálogo de beneficios | [profiles.md](./profiles.md) | Listo en `jact`. Recorrido UI con sesión pendiente |
| 5 | Afiliados | [members.md](./members.md) | Listo en `jact`. Recorrido UI con sesión pendiente |
| 6 | Cuotas y pagos | [fees.md](./fees.md) | Cerrado en `a0b7bf1`. Recorrido UI con sesión pendiente |
| 7 | Entregas | [deliveries.md](./deliveries.md) | Cerrado en `699abb9`. Recorrido UI con sesión pendiente |
| 8 | Inicio | [home.md](./home.md) | Cerrado en `7927161`. Recorrido UI con sesión pendiente |
| 9 | Página pública | [site.md](./site.md) | Cerrado en `264a1ab` (`origin/jact`). Recorrido sin sesión hecho |
| 10 | Formulario de afiliación PDF | [affiliation-form.md](./affiliation-form.md) | Especificado en §10.11. Sin código |

El módulo 8 cierra en `7927161`. El módulo 9 cierra en `264a1ab` (`origin/jact`). El módulo 10 está solo en documentación.

## Qué no tocar

- Módulo 0: Prisma, `0001_init`, semilla, `/api/auth/*`, cookie `casa_session`, `/login`, `/cambiar-clave`, menú por permisos. En `middleware.ts` solo están las excepciones ya hechas: `/api/cron/fees` valida `CRON_SECRET` y `/api/public/site` es pública. El menú no se expande al pasar el cursor. Beneficios navega a `/beneficios`; la flecha abre Entregas. El `RootRedirect` de `/` ya no existe.
- Módulo 1: `src/rules/{money,calendar,fees,benefits}.ts` y sus pruebas.
- Módulo 2: `src/server/modules/settings`, `src/features/settings`, `/api/settings`, `/api/payment-methods`, `/parametros`.
- Módulo 3: `src/server/modules/users`, `src/server/modules/roles`, `src/features/users`, `src/features/roles`, `/api/users`, `/api/roles`, `/api/permissions`, `/usuarios`, `/roles`.
- Módulo 4: `src/server/modules/profiles`, `src/server/modules/benefits`, `src/features/profiles`, `src/features/benefits`, `/api/profiles`, `/api/benefits`, `/perfiles`, `/beneficios`. `/beneficios/entregas` sigue en el módulo 7.
- Módulo 5: `src/server/modules/members`, `src/features/members`, `/api/members`, `/afiliados`. `GET /api/members/[id]` ya llama `ensureFeesUpToDate`; no reabrir la ficha salvo un bug.
- Módulo 6: `src/server/modules/fees`, `src/features/fees`, `/api/fees`, `/api/cron/fees`, `/pagos`, `vercel.json`.
- Módulo 7: `src/server/modules/deliveries`, `src/features/deliveries`, `/api/benefit-deliveries`, `GET /api/members/[id]/benefits`, `/beneficios/entregas`. En la ficha solo se sumó la evaluación y «Registrar entrega».
- Módulo 8: `src/server/modules/home`, `src/features/home`, `/api/dashboard`, `/home`. `GET /api/dashboard` ya llama `ensureFeesUpToDate`.
- Módulo 9: `src/server/modules/site`, `src/features/site`, `/api/public/site`, `/`. Sin datos de afiliados. El auxilio de lentes sigue oculto.

## Deuda conocida

- Recorrido con sesión de `/home`, `/beneficios/entregas`, `/pagos`, `/afiliados`, `/perfiles`, `/beneficios`, `/usuarios`, `/roles` y `/parametros`: sin cookie el panel cae en `/login`. `GET /api/dashboard` responde 401. El navegador embebido usa `http://127.0.0.1:4200`.
- Dev a veces ya está en el puerto 4200 (`EADDRINUSE`): no levantar otro.
- Texto legal del formulario PDF (Ley 1581 de 2012): conviene que lo revise un abogado antes de imprimir en producción. No bloquea el módulo 10.

## Módulo 8 — archivos (listo)

```
src/server/modules/home/         schema, repository, service + pruebas
src/app/api/dashboard/route.ts
src/features/home/               data → domain → viewmodel → view
src/app/(panel)/home/page.tsx    ya existía; sigue delgada
```

Sesión, sin permiso de módulo. Conteos de §10.3, aviso de SMMLV en 0 y recordatorio por `suggestedMonth`.
`GET /api/dashboard` llama `ensureFeesUpToDate` antes de responder. Sin migración. Sin borrado físico.

## Módulo 9 — archivos (listo)

```
src/server/modules/site/         schema, repository, service + pruebas
src/app/api/public/site/route.ts
src/features/site/               data → domain → viewmodel → view
src/app/page.tsx                 delgada, sin shell
```

Sin sesión. Presentación, beneficios públicos, cómo afiliarse y contacto si hay datos.
`middleware.ts` deja pasar `GET /api/public/site`. Sin migración. Sin datos de afiliados.
E2E: 9 pruebas en verde. Ajustes de build: `tsconfig` ES2022, genérico de selects, tipos Prisma unchecked / `requireSettings`.

## Módulo 10 — archivos (especificado, sin código)

```
(pendiente) GET /api/public/affiliation-form
(pendiente) generación o servicio del PDF
(pendiente) botón en SiteView y en la vista de login
docs/features/affiliation-form.md
```

Ver REQUERIMIENTOS §10.11.

## Comandos

```bat
nvm use 22
npm test
npm run lint
npm run test:e2e
npm run dev
```

Dev en el puerto **4200**. Base: rama `dev` de Neon vía `.env.local`. Nunca migrar ni escribir contra producción.
