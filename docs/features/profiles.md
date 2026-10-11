# Perfiles y catálogo de beneficios

- Requerimiento: REQUERIMIENTOS.md §8.6 (catálogo), §9.8, §9.9, §10.6 (solo catálogo), §10.7, §13 módulo 4
- Estado: listo (código y pruebas). Recorrido con sesión pendiente.

## Qué resuelve

Permite ver y editar los perfiles de afiliación y el catálogo de beneficios. La cuota que se muestra es la plena del perfil con el SMMLV vigente. No registra entregas: eso es el módulo 7.

## Pantallas

- `/perfiles` — `profiles.view` para entrar y ver nombre, porcentaje, cuota, beneficios y estado. `profiles.manage` para crear, editar y activar o inactivar. Sin ese permiso el formulario abre en solo lectura.
- `/beneficios` — `benefits.view` para ver el catálogo. `benefits.manage` para alta y edición. `/beneficios/entregas` sigue siendo el placeholder del módulo 7.

Un perfil inactivo no se asigna a afiliados nuevos. Quien ya lo tiene lo conserva. Un beneficio inactivo deja de salir en la página pública y no se borra.

## API

- `GET /api/profiles` — `profiles.view`. Perfiles con `percent` en texto (`"1.70"`), beneficios incluidos, `fullFee` en pesos y el `minimumWage` vigente. También devuelve el catálogo `{ id, name, isActive }` para el formulario, sin exigir `benefits.view`.
- `POST /api/profiles` · `PATCH /api/profiles/[id]` — `profiles.manage`. 409 si el nombre ya existe. 400 si un beneficio no existe.
- `GET /api/benefits` — `benefits.view`. Catálogo completo.
- `POST /api/benefits` · `PATCH /api/benefits/[id]` — `benefits.manage`. El anual queda con máximo 1. El eventual admite de 1 a 12. Si `isPublic` es verdadero, el texto público es obligatorio.

No hay `DELETE`. Sin sesión las lecturas responden 401.

## Datos

Sin migración. Usa `MembershipProfile`, `Benefit` y `ProfileBenefit` de `0001_init`. Marcar beneficios de un perfil reemplaza filas de `profile_benefits`; el perfil no se borra.

Bitácora: `profile.create`, `profile.update`, `benefit.create`, `benefit.update`, con antes y después. El cambio de estado va en `*.update`.

## Reglas aplicadas

No hay fórmulas nuevas. La cuota plena usa `quoteFullFee` de `src/rules`.

- Ejemplo: SMMLV $1.000.000 y perfil 1,70 % → $17.000. Con el SMMLV en 0 la cuota es $0.
- El porcentaje viaja como texto `"1.70"`, mayor que 0 y máximo 100.
- Un beneficio anual siempre guarda `maxDeliveriesPerYear = 1`.

## Decisiones

- Dos features (`profiles`, `benefits`) y dos módulos de servidor.
- El alta deja el registro activo. Activar e inactivar usa la confirmación de `DatatableLocal`.
- `GET /api/profiles` incluye el SMMLV y los beneficios para la vista previa y las casillas, porque quien administra perfiles puede no tener `benefits.view`.
- Sin Excel: §10.10 no lista estas tablas.
- La entrega, la excepción y la anulación no se implementan aquí.

## Verificación

- [x] lint (`npm run lint`, Node 22)
- [x] test: 144 pruebas, incluidas `profiles.schema.test.ts`, `profiles.service.test.ts` (cuota $17.000 y 409), `profilesService.test.ts`, `benefits.schema.test.ts`, `benefits.service.test.ts` (anual en 1, texto público, inactivar) y `benefitsService.test.ts`
- [x] API sin sesión: `GET /api/profiles` y `GET /api/benefits` responden 401
- [ ] recorrido en navegador con sesión: feliz, vacío, error, sin permiso
- [x] checklist UI en código: `DatatableLocal`, campos `shared/ui/mui`, botones `customButtons`, `AppDialog`, papers 16px, estado con texto
- [x] auditoría: sin CRITICAL ni MAJOR

## Cómo retomar

El índice está en `docs/features/README.md`. Siguiente módulo: **5 Afiliados**. No reabrir este módulo salvo un bug o el recorrido con sesión.
