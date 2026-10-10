# ARCHITECTURE AUDITOR — REVISIÓN AUTO-GUIADA (CASA)

## Referencias activas
- `docs/REQUERIMIENTOS.md`
- `docs/decisions/*`
- `docs/prompts/0_system_architect.md`
- `docs/prompts/1_project_context.md`
- `docs/prompts/2_architecture_rules.md`
- `docs/prompts/3_development_workflow.md`
- `docs/architecture.md`
- `docs/ui-kit.md`
- `docs/shared-components.md`

## Objetivo
Detectar desviaciones de MVVM, del UI kit y deuda que se vaya a copiar.
Proponer refactors concretos. No “normalizar” violaciones existentes.

## Clasificación

### CRITICAL
- `route.ts` que lee o escribe datos sin exigir sesión y permiso.
- Monto guardado que no calculó el servidor con `src/rules`.
- Fórmula de dinero o elegibilidad duplicada fuera de `src/rules`.
- Operación de `REQUERIMIENTOS.md` §12 sin transacción.
- Cambio de esquema sin migración de Prisma.
- View o page haciendo I/O remota.
- `core` o `shared` importando `features` o `server`.
- Tokens o credenciales de sesión en `localStorage` o en la view.
- Secretos en código versionado o con prefijo `NEXT_PUBLIC_`.
- Filtrar URLs, headers o payloads crudos fuera de `data/`.

### MAJOR
- Función de `src/rules` sin prueba, o que lee la hora del sistema.
- Prisma usado directo en un `route.ts`.
- Entrada de la API sin validar con Zod.
- Archivo de `src/server` sin `server-only`.
- Operación sensible sin registro en `AuditLog`.
- Borrado físico de datos de negocio.
- ViewModel llamando `HttpRequestProvider`.
- Domain con JSX.
- Botones/inputs ad-hoc que rompen la familia redondeada (`borderRadius: 0` o CTA no píldora).
- Hex de marca sueltos en una pantalla nueva.
- Tabla o form reimplementados en vez de `Datatable*` / `shared/ui/mui`.
- Feature sin `data/domain/viewmodel/view` cuando el caso lo requiere.

### MINOR
- Naming inconsistente.
- Uso de aliases deprecados (`customButtons.orange`).
- `sx` que pisa radio a 12px en un CTA.
- Archivos con espacios o sufijo ` - original`.
- Duplicación menor de estilos.

## Checklist

### Capas
- Dirección view → viewmodel → domain → data → core.
- Page delgada.
- Shared sin imports a features.

### Servidor y reglas
- `route.ts`: sesión → `requirePermission` → Zod → servicio.
- Servicio: reglas de `src/rules`, transacción y bitácora donde aplica.
- Repositorio: solo Prisma.
- `src/rules`: sin imports del proyecto, "hoy" por parámetro, pesos enteros, pruebas con los ejemplos del requerimiento.

### Integración / sesión
- I/O del cliente solo en `data/`, contra `/api`.
- View/viewmodel/domain sin clientes HTTP ni URLs.
- Credenciales fuera de `localStorage` y de la UI.
- Errores de red mapeados a UI (toast/form), no tragados en silencio.
- Acciones ocultas a quien no tiene el permiso (y bloqueadas en la API).

### UI kit
- Botones: `customButtons` o `HoverIconButton`; radio 9999px; alto 44.
- Campos: wrappers MUI; radio 20px; alto 45.
- Cards/tablas: radio ≥ 16px.
- Cero `borderRadius: 0` en controles interactivos.
- Colores desde `designTokens` / palette.
- Modales: `AppDialog`.
- No usar `uniformFieldHeight3` ni archivos `*Original*`.

### Shared
- No hay un tercer botón/input “solo de esta pantalla” si ya existe equivalente.

## Formato de salida (obligatorio)

### 1. Resumen
- Alcance auditado.
- Estado por capa (rules/server/api/data/domain/viewmodel/view/shared/styles).

### 2. Problemas
Para cada hallazgo:
- Severidad
- Regla de `2_architecture_rules.md`
- Evidencia (archivo)
- Problema
- Impacto
- Propuesta
- Ejemplo mínimo si aporta

### 3. Evaluación final
Excelente / Buena / Aceptable / Necesita refactorización / Crítica

Veredicto de gate:
- “Apto para avanzar” — sin CRITICAL/MAJOR pendientes
- “Bloqueado por refactor” — hay CRITICAL o MAJOR

### 4. Cierre
- Top 3 deudas.
- Orden de refactor sugerido: capas primero, luego UI kit.
