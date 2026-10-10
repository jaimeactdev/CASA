# DOCUMENTATION WORKFLOW — QUÉ SE ACTUALIZA (CASA)

## Propósito
Mantener `/docs` alineado al código con el mínimo de papel (ADR-005).

## Regla base
- Al cerrar un módulo, el asistente DEBE escribir `docs/features/<modulo>.md` (formato en `11_feature_docs_standard.md`).
- Si cambió una regla, un campo, una ruta o un permiso, el asistente DEBE corregir `docs/REQUERIMIENTOS.md` en el mismo cierre.
- El resto de `/docs` se cambia por propuesta: el asistente propone y aplica si el usuario lo aprueba.

## Jerarquía documental
- `docs/decisions/*`: por qué el sistema es como es.
- `docs/REQUERIMIENTOS.md`: qué hace (reglas, datos, pantallas, API, permisos).
- `/docs` canónico: `architecture.md`, `ui-kit.md`, `shared-components.md`, `conventions.md`, `BRANDING.md`.
- `docs/features/*`: lo que se construyó en cada módulo. NO DEBE competir con los anteriores.
- `docs/prompts/*`: contrato del asistente, no guía humana.

## Ownership (qué va en cada archivo)
- `docs/REQUERIMIENTOS.md`: reglas de negocio, modelo de datos, permisos, pantallas, API.
- `docs/architecture.md`: capas, MVVM, servidor, providers, sesión, deuda de estructura.
- `docs/ui-kit.md`: radio, botones, color, campos, tablas, modales, checklist visual.
- `docs/shared-components.md`: catálogo de controles y cuándo usarlos.
- `docs/conventions.md`: naming, idioma, integración con `/api`, imports.
- `docs/BRANDING.md`: identidad, logos y color.
- `docs/features/<modulo>.md`: resumen del módulo y su verificación.
- `docs/decisions/*`: ADR.

## Gatillos
- Módulo cerrado → `docs/features/<modulo>.md`.
- Regla, campo, ruta o permiso nuevo o cambiado → `REQUERIMIENTOS.md`.
- Carpeta o capa nueva → `architecture.md`.
- Control shared nuevo → `shared-components.md`.
- Cambio de radio, botón, color o campo canónico → `ui-kit.md` (+ tokens).
- Cambio de naming o estructura de carpetas → `conventions.md`.
- Decisión estructural (librería nueva, cambio de proveedor, cambio de sesión) → ADR.

## Formato de propuesta
- Archivo:
- Sección:
- Cambio propuesto:
- Motivo:

## Política de no duplicación
- La documentación NO DEBE contradecir `docs/prompts/2_architecture_rules.md`.
- Si docs y código divergen, se reporta como deuda y se propone alineación.
- No copiar reglas de negocio ni el UI kit dentro de un doc de módulo: enlazarlos.
