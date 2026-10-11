# Afiliados

- Requerimiento: REQUERIMIENTOS.md §8.1, §8.4, §8.5, §8.7, §9.10, §10.4, §12.1, §13 módulo 5
- Estado: listo (código y pruebas). Recorrido con sesión pendiente.

## Qué resuelve

Permite registrar y consultar afiliados por ventanilla. El alta, en una transacción, asigna el número, crea la cuota del mes y, si aplica, la de ingreso. No borra fichas: se suspenden o se retiran.

## Pantallas

- `/afiliados` — `members.view` para entrar, buscar, filtrar y ver la ficha. `members.create` para el alta. `members.edit` para cambiar datos, perfil o estado.
- El alta se bloquea si el SMMLV está en 0. La pregunta de cuota de ingreso solo aparece cuando el parámetro es mayor que 0.
- La ficha (Drawer) muestra datos, cómo se calcula la cuota vigente, aportes, cuotas y beneficios del perfil. No registra pagos ni entregas.

## API

- `GET /api/members` — `members.view`. Listado con totales calculados, perfiles para el formulario y el SMMLV / cuota de ingreso vigentes.
- `POST /api/members` — `members.create`. Alta en una transacción. 409 si el SMMLV está en 0 o el documento ya existe. 409 si el perfil está inactivo.
- `GET /api/members/[id]` — `members.view`. Ficha completa: cuotas, aportes y beneficios del perfil en el año.
- `PATCH /api/members/[id]` — `members.edit`. Edita datos, estado o perfil. No regenera cuotas. 404 si no existe.

No hay `DELETE`. `GET /api/members/[id]/benefits` queda para el módulo 7. Sin sesión las lecturas responden 401.

## Datos

Sin migración. Usa `Member` y `Fee` de `0001_init`. El número es la secuencia de `memberNumber`. La unicidad de ingreso ya está en el índice parcial de la migración inicial.

Bitácora: `member.create`, `member.update`, `member.status_change` y `fee.generate` por cada cuota del alta.

## Reglas aplicadas

Sin fórmulas nuevas. Usa `quoteMonthlyFee`, `quoteFullFee`, `periodDates`, `canGenerateMonthlyFee`, `isMemberInArrears`, `sumTotalPaid`, `countPaidMonthlyFeesInYear` y `evaluateBenefit` de `src/rules`.

- SMMLV $1.000.000 y perfil 1,70 % → cuota plena $17.000.
- Afiliarse el 16 con corte el 15 y primera cuota al 50 % → base $8.500, reducida.
- Afiliarse el 10 → base $17.000, completa.
- SMMLV en 0 → 409 y no se crea nada.
- La cuota de ingreso solo se crea si el parámetro es mayor que 0 y en el alta se eligió cobrarla.

## Decisiones

- Un feature `members` y un módulo de servidor. La página reemplaza el `ModulePlaceholder`.
- El listado filtra en el cliente (cientos de afiliados). Excel usa las columnas de §10.10.
- La ficha lee `GET /api/members/[id]`. Los beneficios se evalúan ahí para mostrar mínimo, recepción y bloqueo del paseo; no hay botón de entrega.
- `ensureFeesUpToDate` y el registro de pagos quedan para el módulo 6.
- El alta siempre nace Activo. El estado se cambia en la edición.

## Verificación

- [x] lint (`npm run lint`, Node 22)
- [x] test: 164 pruebas, incluidas `members.schema.test.ts`, `members.service.test.ts` (cuota $17.000 / $8.500, ingreso, 409 por SMMLV 0, documento duplicado, perfil inactivo, `status_change`) y `membersService.test.ts`
- [x] API sin sesión: `GET /api/members` y `GET /api/members/[id]` responden 401. `/afiliados` cae en `/login`
- [ ] recorrido en navegador con sesión: feliz, vacío, error, sin permiso
- [x] checklist UI en código: `DatatableLocal`, campos `shared/ui/mui`, botones `customButtons`, `AppDialog`, Drawer 16px, estado con texto
- [x] auditoría: sin CRITICAL ni MAJOR

## Cómo retomar

El índice está en `docs/features/README.md`. Siguiente módulo: **6 Cuotas y pagos**. No reabrir este módulo salvo un bug o el recorrido con sesión.
