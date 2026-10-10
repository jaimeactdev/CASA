# PROMPT EVOLUTION — GOBERNANZA Y CAMBIO CONTROLADO (CASA)

## Propósito
Evolucionar el sistema de prompts sin duplicar reglas ni degradar el UI kit.

## Referencias activas
- `docs/prompts/0_system_architect.md` … `7_refactor_assistant.md`
- `docs/architecture.md`, `docs/ui-kit.md`

## Principios
- Un cambio a prompts debe mejorar consistencia, precisión y seguridad.
- Prompts compatibles entre sí, sin DEBE/NO DEBE duplicados.
- Cambios pequeños, revisables, reversibles.

## Ownership
- Las reglas prescriptivas viven **solo** en `2_architecture_rules.md`.
- El contenido ilustrado de forma/color vive en `docs/ui-kit.md`; `2` solo
  referencia y endurece lo no negociable.
- Los demás prompts operacionalizan flujo, checklist y formato.

## Cuándo evolucionar
- Hallazgos repetidos en auditorías (p. ej. CTAs no píldora, I/O remota en la view).
- Convención nueva real en el repo (tests, Query, nuevo wrapper MUI).
- Cambio de stack (versión Next/MUI).

## Cuándo NO evolucionar
- Excepción puntual que no se repetirá.
- Patrón nuevo sin evidencia en el código.
- Duplicar un párrafo de `2` o de `ui-kit.md`.

## Tipos de mejora permitidos
- Agregar DEBE/NO DEBE **solo** en `2`.
- Clarificar, eliminar redundancia, alinear prompts.
- Actualizar ejemplos de ubicación de archivos.

## Proceso de evolución
1. Problema recurrente + evidencia (archivos).
2. ¿Ya está cubierto en `2` o `ui-kit.md`? Si sí, no agregar prompt.
3. Propuesta: archivo, sección, texto, motivo.
4. Esperar aprobación del usuario.
5. Aplicar el cambio mínimo.

## Anti-patrones a vigilar en este repo
- Copiar `borderRadius: 12px` del login.
- Usar `uniformFieldHeight3`.
- Crear un segundo feature de login en paralelo a `features/login`.
- Crear campos en `shared/components` en lugar de `shared/ui/mui`.
- Archivos `*Original*` / nombres con espacio como plantilla.
