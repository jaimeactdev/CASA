# AGENTS

Contrato operativo de CASA (monolito Next.js: frontend + API + PostgreSQL).
Antes de implementar, auditar o documentar, cargar en este orden:

1. `docs/REQUERIMIENTOS.md`
2. `docs/prompts/1_project_context.md`
3. `docs/prompts/2_architecture_rules.md`
4. `docs/prompts/3_development_workflow.md`
5. `docs/prompts/4_documentation_workflow.md`
6. `docs/architecture.md`
7. `docs/ui-kit.md`

Decisiones: `docs/decisions/ADR-*.md`.

Prompts situacionales: `5_feature_generator.md`, `6_architecture_auditor.md`,
`7_refactor_assistant.md`, `8_prompt_evolution.md`, `11_feature_docs_standard.md`.

Router y modos: `docs/prompts/0_system_architect.md`.

Índice humano: `docs/README.md`.

Reglas no negociables (detalle en `2` y `ui-kit.md`):

- Código, comentarios, rutas de API y claves de permiso en inglés; copy de UI en español.
- Fórmulas de cuota, recargo y beneficios solo en `src/rules`, puras y con pruebas. El servidor calcula lo que se guarda.
- Cada `route.ts` exige sesión y permiso (`requirePermission`) y valida con Zod.
- Cliente en MVVM: `data` → `domain` → `viewmodel` → `view`. Pages delgadas. I/O del cliente solo en repositorios contra `/api`.
- Sesión solo en la cookie HttpOnly. Sin tokens en `localStorage` ni en la UI.
- Cambios de base solo con migraciones de Prisma. Nunca migrar ni escribir contra producción.
- Botones de acción: `theme.customButtons.*` o `HoverIconButton`, píldora 44px.
- Campos: `src/shared/ui/mui/*`, radio 20px. Sin `borderRadius: 0` en controles.
- Colores desde `src/styles/designTokens.ts`. Sin hex de marca sueltos.
- No copiar deuda (`uniformFieldHeight3`, `GenericTablePagination`).
- No git salvo que el usuario lo pida en el mismo turno.
- Respuestas en español (Colombia).
