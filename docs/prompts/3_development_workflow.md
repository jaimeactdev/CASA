# DEVELOPMENT WORKFLOW — POR MÓDULO (CASA)

## Propósito
Construir cada módulo completo, sin romper capas ni la familia visual, con las reglas de dinero probadas. Proceso liviano para dos personas (ADR-005).

## Unidad de trabajo
- La unidad es el **módulo** (ver `docs/REQUERIMIENTOS.md`, sección 13).
- El asistente construye el módulo completo sin pedir aprobación entre pasos.
- Se detiene al cerrar el módulo, o antes solo si encuentra una ambigüedad que cambie una regla de negocio o la base de datos.

## Orden dentro del módulo
1. **Contexto (sin código):** leer la sección del módulo en `REQUERIMIENTOS.md`. Listar pantallas, API, tablas y reglas que toca. Declarar supuestos.
2. **Rules:** funciones nuevas en `src/rules` con su prueba, usando los ejemplos del requerimiento.
3. **Server:** cambios de `schema.prisma` y su migración, schema Zod, repository, service y `route.ts`.
4. **Data:** repositorio del feature contra `/api`.
5. **Domain:** tipos y validación de formularios del feature.
6. **ViewModel:** estado, handlers y toasts.
7. **View:** pantalla con el kit, página delgada, menú con permiso y migas.
8. **Cierre:** revisión y documento del módulo.

## Revisión de cierre (gate)
Un módulo está listo solo si:
- `npm run lint` pasa.
- `npm test` pasa, con pruebas de toda función nueva de `src/rules` y de las reglas de cada servicio.
- Se recorrió la pantalla: caso feliz, lista vacía, error de la API, usuario sin permiso (la API responde 403 y la UI no muestra la acción).
- Checklist de UI (`docs/ui-kit.md`):
  - botones píldora vía `customButtons` / `HoverIconButton`
  - campos `shared/ui/mui` (radio 20px)
  - cero `borderRadius: 0` en controles
  - colores desde tokens; estados con texto, no solo color
- Una pasada de `6_architecture_auditor.md` sin CRITICAL ni MAJOR.
- `npm run test:e2e` solo si se tocó login, sesión, `middleware.ts` o el shell.

## Regla operativa: el asistente NO ejecuta git
- El asistente NUNCA ejecuta comandos git salvo que el usuario lo pida explícitamente en ese mismo turno.
- Si hace falta un commit, proponer el mensaje y esperar instrucción.

## Regla operativa: migraciones
- El asistente PUEDE ejecutar `prisma migrate dev` solo contra la rama `dev` de Neon (`.env.local`).
- El asistente NUNCA ejecuta migraciones, semillas ni consultas de escritura contra producción.

## Cierre
- Crear o actualizar `docs/features/<modulo>.md` (ver `11_feature_docs_standard.md`).
- Si cambió una regla, un campo o una ruta, actualizar `docs/REQUERIMIENTOS.md` en el mismo cierre.
- Si se tomó una decisión estructural, proponer un ADR.
