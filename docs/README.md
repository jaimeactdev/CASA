# Documentación de CASA

Mapa de qué hace la aplicación y cómo se construye. El código que contradiga
estas reglas es deuda: no se copia.

## Para personas

| Documento | Contenido |
|-----------|-----------|
| [REQUERIMIENTOS.md](./REQUERIMIENTOS.md) | Qué hace CASA: reglas, datos, permisos, pantallas, API, orden de construcción |
| [decisions/](./decisions/) | ADR: monolito en Vercel, sesión propia, capa server, Neon + Prisma, proceso liviano |
| [architecture.md](./architecture.md) | Capas: MVVM en el cliente, Route Handlers, `src/server`, `src/rules` |
| [ui-kit.md](./ui-kit.md) | Forma (píldora), color, botones, campos, tablas, modales |
| [shared-components.md](./shared-components.md) | Catálogo de controles y cuándo usar cada uno |
| [conventions.md](./conventions.md) | Naming, idioma, integración con `/api`, imports |
| [BRANDING.md](./BRANDING.md) | Nombre, logos y color |
| [session-timeout-implementation.md](./session-timeout-implementation.md) | Timeout de inactividad |
| `features/<modulo>.md` | Un resumen por módulo construido |

Arranque del repo: [README](../README.md).

## Para el asistente (prompts)

Load order:

| # | Archivo | Rol |
|---|---------|-----|
| 0 | [prompts/0_system_architect.md](./prompts/0_system_architect.md) | Router y contrato |
| 1 | [prompts/1_project_context.md](./prompts/1_project_context.md) | Mapa del repo |
| 2 | [prompts/2_architecture_rules.md](./prompts/2_architecture_rules.md) | DEBE / NO DEBE (capas, API, UI) |
| 3 | [prompts/3_development_workflow.md](./prompts/3_development_workflow.md) | Orden por módulo y gate de cierre |
| 4 | [prompts/4_documentation_workflow.md](./prompts/4_documentation_workflow.md) | Qué docs se actualizan |
| 5 | [prompts/5_feature_generator.md](./prompts/5_feature_generator.md) | Construir un módulo |
| 6 | [prompts/6_architecture_auditor.md](./prompts/6_architecture_auditor.md) | Auditoría |
| 7 | [prompts/7_refactor_assistant.md](./prompts/7_refactor_assistant.md) | Refactor |
| 8 | [prompts/8_prompt_evolution.md](./prompts/8_prompt_evolution.md) | Gobernanza de prompts |
| 11 | [prompts/11_feature_docs_standard.md](./prompts/11_feature_docs_standard.md) | Documento único por módulo |

`2_architecture_rules.md` gana en reglas. `3_development_workflow.md` gana en proceso.

## Cómo agregar un módulo (resumen)

1. Reglas en `src/rules` con su prueba.
2. `src/server/modules/<modulo>` y `src/app/api/<recurso>/route.ts`.
3. Copiar `src/features/ejemplo` e implementar `data` → `domain` → `viewmodel` → `view`.
4. Página delgada en `src/app/(panel)/<ruta>/page.tsx`.
5. Menú (con permiso) y migas.
6. Solo kit de `docs/ui-kit.md` y `docs/shared-components.md`.
7. `docs/features/<modulo>.md`.
