# ADR-005 — Proceso de trabajo liviano

- Estado: aceptado
- Fecha: 2026-10-09
- Ajusta: `docs/prompts/3_development_workflow.md` y `docs/prompts/11_feature_docs_standard.md`

## Contexto

La plantilla trae un proceso para equipos: aprobación por bloque, auditoría y refactor por bloque, y cuatro documentos por feature, con historias de usuario.

CASA la construyen y usan dos personas. Lo importante es que las reglas de dinero estén probadas y que la arquitectura no se degrade.

## Decisión

- La fuente funcional es `docs/REQUERIMIENTOS.md`. No se escriben historias de usuario.
- Cada módulo tiene un solo documento, `docs/features/<modulo>.md`, con propósito, pantallas, API, reglas que aplica y una lista de verificación.
- Un módulo se construye completo, en este orden: rules, server y API, data, domain, viewmodel, view. Se revisa al final, no por bloque.
- La revisión de cierre de un módulo exige:
  1. `npm run lint` sin errores.
  2. `npm test` en verde, con pruebas de toda función nueva en `src/rules`.
  3. Recorrido manual de la pantalla: caso feliz, vacío, error y sin permiso.
  4. Una pasada de `6_architecture_auditor.md` sobre el módulo.
- E2E de Playwright solo para login, sesión y el shell.

## Consecuencias

- `04-Progreso.md` y `02-HU.md` dejan de existir.
- El asistente no se detiene a pedir aprobación entre bloques de un mismo módulo. Sí se detiene al cerrar el módulo.
