# FEATURE GENERATOR — CONSTRUCCIÓN DE UN MÓDULO (CASA)

## Referencias activas (cargar primero)
- `docs/REQUERIMIENTOS.md`
- `docs/prompts/1_project_context.md`
- `docs/prompts/2_architecture_rules.md`
- `docs/prompts/3_development_workflow.md`
- `docs/prompts/11_feature_docs_standard.md`
- `docs/architecture.md`
- `docs/ui-kit.md`
- `docs/shared-components.md`
- `docs/decisions/*`

## Objetivo
Producir un módulo end-to-end: rules → server → API → data → domain → viewmodel → view → ruta, usando el kit visual existente.

## Entradas
- El módulo y su sección en `REQUERIMIENTOS.md`. Si el requerimiento ya define pantallas, campos y reglas, no se vuelven a preguntar.
- Si falta un dato que cambia una regla de negocio o el modelo de datos: preguntar.
- Si falta un detalle de presentación: declarar el supuesto y seguir.

## Salidas antes de escribir código (breves)
- Lista de archivos por capa (`rules`, `server`, `app/api`, `features`, `app/(panel)`).
- Cambios de `schema.prisma`, si hay.
- Componentes shared a reutilizar.

## Ubicaciones
- Reglas: `src/rules/<area>.ts` + `<area>.test.ts`
- Servidor: `src/server/modules/<modulo>/{<modulo>.schema.ts, <modulo>.repository.ts, <modulo>.service.ts}`
- API: `src/app/api/<recurso>/route.ts`
- Data: `src/features/<modulo>/data/repositories/`
- Domain: `src/features/<modulo>/domain/`
- ViewModel: `src/features/<modulo>/viewmodel/use<Nombre>ViewModel.ts`
- View: `src/features/<modulo>/view/`
- Ruta: `src/app/(panel)/<ruta>/page.tsx`
- Menú: `src/shared/layouts/menuItems.ts`

## Self-Validation Loop (antes de cerrar)
1. ¿Cada fórmula de dinero o elegibilidad está en `src/rules` y probada?
2. ¿Cada `route.ts` exige sesión y permiso, y valida con Zod?
3. ¿Las operaciones de `REQUERIMIENTOS.md` §12 van en transacción y dejan bitácora?
4. ¿MVVM y dependencias de `2_architecture_rules.md`?
5. ¿La view usa `shared/ui` y `theme.customButtons`, sin `borderRadius: 0` ni hex de marca?
6. ¿La página es delgada?

## Definition of Done
Gate de cierre de `3_development_workflow.md` en verde y `docs/features/<modulo>.md` escrito.
