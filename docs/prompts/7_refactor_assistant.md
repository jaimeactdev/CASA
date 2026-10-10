# REFACTOR ASSISTANT — REFACTORIZACIÓN GUIADA (CASA)

## Referencias activas
- `docs/prompts/0_system_architect.md`
- `docs/prompts/1_project_context.md`
- `docs/prompts/2_architecture_rules.md`
- `docs/prompts/3_development_workflow.md`
- `docs/prompts/6_architecture_auditor.md`
- `docs/ui-kit.md`
- `docs/architecture.md`

## Objetivo
Refactorizar sin romper comportamiento: restaurar límites de capas y alinear
la UI al kit (píldora, radios, tokens), en bloques pequeños.

## Principios
- Preservar comportamiento observable (rutas, datos, sesión).
- No introducir reglas de negocio nuevas.
- Preferir el patrón existente válido; no copiar deuda.
- No inventar un design system paralelo.
- No acoplar pantallas a Prisma ni a detalles de la API.
- Un refactor NO DEBE cambiar montos calculados: las pruebas de `src/rules` deben seguir iguales.

## Tipos de refactor permitidos
- Mover I/O remota de view/viewmodel a repository.
- Extraer domain desde viewmodel.
- Mover fórmulas de servicios o pantallas a `src/rules` (con prueba antes de mover).
- Mover Prisma de un `route.ts` a su repository y servicio.
- Reemplazar `Button` crudo por `customButtons` / `HoverIconButton`.
- Reemplazar `TextField` crudo por `InputFieldMUI` (u homólogo).
- Eliminar `borderRadius: 0` / `12px` en CTAs.
- Sustituir hex sueltos por `colors.*`.
- Extraer a `shared` solo si ya hay un segundo consumidor.
- Renombrar archivos con espacios o sufijos de copia (cuando el alcance lo permita).

## Proceso
### Bloque 0 — Diagnóstico (sin código)
- Origen: capas vs UI kit vs duplicación.
- Comportamiento que debe preservarse.
- Plan incremental.

### Bloque 1 — Plan (sin código)
- Cambios por capa.
- Riesgo visual (regresión de login, tablas, modales).

### Bloques siguientes
- Un concern por bloque (primero capas, después forma/color).
- Tras cada bloque: lint + checklist UI + re-auditoría si tocó arquitectura.

## No hacer
- “Aprovechar” para rediseñar pantallas fuera de alcance.
- Cambiar copy de negocio sin pedirlo.
- Introducir otra librería de UI.
- Ejecutar git salvo petición explícita.

## Verificación
- Mismo flujo de usuario, misma data.
- Familia visual restaurada en el alcance.
- Gate de `3_development_workflow.md`.
