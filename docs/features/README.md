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
Continúa CASA en el módulo 3 (usuarios y roles). No reescribas los módulos 0, 1 ni 2.

Antes de implementar, carga en este orden:
AGENTS.md, docs/REQUERIMIENTOS.md, docs/prompts/1_project_context.md,
docs/prompts/2_architecture_rules.md, docs/prompts/3_development_workflow.md,
docs/prompts/4_documentation_workflow.md, docs/prompts/5_feature_generator.md,
docs/architecture.md, docs/ui-kit.md, docs/features/README.md,
docs/features/settings.md.

Node: nvm use 22 (el default de la máquina es 18). Sin git salvo que lo pida
en el mismo turno. Responde en español (Colombia).

Construye el módulo 3 completo según REQUERIMIENTOS §6, §9.5–§9.7, §10.8,
§12 (bitácora user.* y role.permissions_change) y §13: /usuarios y /roles
(hoy son ModulePlaceholder). API: /api/users, /api/roles, /api/permissions.
Roles de sistema Administrador y Operativo: no se eliminan ni se desactivan.
Nadie se quita a sí mismo el rol Administrador ni se desactiva. Al asignar
clave, mustChangePassword = true. Kit: DatatableLocal, shared/ui/mui,
ConfirmRecordActionModal, AppDialog. Sin fórmulas nuevas en src/rules.

Al cerrar: lint + test en Node 22, docs/features/users.md (o el nombre del
feature) y actualizar este README. El módulo 2 quedó listo y sin commit;
no lo reabras salvo un bug.
```

## Estado

| # | Módulo | Doc | Estado |
|---|---|---|---|
| 0 | Base (Prisma, semilla, sesión, login, menú) | [base.md](./base.md) | Listo y commiteado |
| 1 | Reglas (`src/rules`) | [rules.md](./rules.md) | Listo y commiteado |
| 2 | Parámetros y medios de pago | [settings.md](./settings.md) | Listo (código + pruebas). Sin commit. Recorrido UI con sesión pendiente |
| 3 | Usuarios y roles | — | **Siguiente** |
| 4 | Perfiles y beneficios (catálogo) | — | Pendiente. Ahí se edita el % del perfil (1,70% del General) |
| 5 | Afiliados | — | Pendiente |
| 6 | Cuotas y pagos | — | Pendiente |
| 7 | Entregas | — | Pendiente |
| 8 | Inicio | — | Pendiente |
| 9 | Página pública | — | Pendiente |

Commit que cierra 0+1 (rama `jact`): `Cerrar base y reglas: sesión propia y fórmulas de cuota.`
El módulo 2 aún no está en git hasta que lo pidan.

## Qué no tocar

- Módulo 0: Prisma, `0001_init`, semilla, `/api/auth/*`, cookie `casa_session`, `/login`, `/cambiar-clave`, `middleware.ts`, menú por permisos.
- Módulo 1: `src/rules/{money,calendar,fees,benefits}.ts` y sus pruebas.
- Módulo 2: `src/server/modules/settings`, `src/features/settings`, `/api/settings`, `/api/payment-methods`, `/parametros`. Solo un bug o el recorrido con sesión.

## Módulo 2 — archivos (cerrado)

```
src/server/modules/settings/     schema, repository, service + pruebas
src/app/api/settings/route.ts
src/app/api/payment-methods/route.ts
src/app/api/payment-methods/[id]/route.ts
src/features/settings/           data → domain → viewmodel → view
src/app/(panel)/parametros/page.tsx
src/core/network/httpRequestProvider.ts   +patch y 409
src/shared/ui/DatatableLocal.tsx          +'use client'
src/shared/ui/mui/InputFieldMUI.tsx       wrapper width 100%
```

Permisos: `settings.view` / `settings.edit`. El operativo **no** los tiene.
GET settings incluye perfiles activos solo para la preview. El 1,70% no es parámetro global.

## Deuda conocida (no bloquea el módulo 3)

- Recorrido de `/parametros` con sesión: el login del admin respondió 400; falta sembrar o definir `ADMIN_EMAIL` / `ADMIN_PASSWORD` en `.env.local`. El navegador embebido no resuelve `localhost`; usar `http://127.0.0.1:4200`.
- Dev a veces ya está en el puerto 4200 (`EADDRINUSE`): no levantar otro.

## Módulo 3 — punto de partida

- Rutas: `/usuarios`, `/roles` (hoy son `ModulePlaceholder`).
- API: `/api/users`, `/api/roles`, `/api/permissions` (§5.5).
- Modelos ya en Prisma: `User`, `Role`, `Permission`, `RolePermission`. Sin migración nueva.
- Roles de sistema Administrador y Operativo (`isSystem`): no se eliminan ni se desactivan.
- Nadie se quita a sí mismo el rol Administrador ni se desactiva.
- Al asignar clave, `mustChangePassword = true`. Correo único. Clave mínimo 8. Usuario inactivo no entra y no se borra.
- Bitácora: `user.create`, `user.update`, `user.deactivate`, `user.role_change`, `user.password_reset`, `role.permissions_change`.
- Feature sugerido: `users` y `roles` (o un módulo `access` si se quiere un solo servidor; el requerimiento los trata juntos).
- Kit: `DatatableLocal`, `shared/ui/mui`, `ConfirmRecordActionModal`, `AppDialog`.
- No hay reglas nuevas en `src/rules`.
- Permisos: `users.view` / `users.manage`, `roles.view` / `roles.manage`. El operativo no los tiene.

## Comandos

```bat
nvm use 22
npm test
npm run lint
npm run dev
```

Dev en el puerto **4200**. Base: rama `dev` de Neon vía `.env.local`. Nunca migrar ni escribir contra producción.
