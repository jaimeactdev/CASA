# Cuotas y pagos

- Requerimiento: REQUERIMIENTOS.md §5.6, §8.1, §8.2, §8.3, §10.5, §10.10, §12.2, §12.3, §13 módulo 6
- Estado: listo (código y pruebas). Recorrido con sesión pendiente.

## Qué resuelve

Genera la cuota del mes para los afiliados activos, pasa a morosas las que ya vencieron y deja registrar o corregir el pago en ventanilla. El valor que se guarda lo calcula el servidor con `src/rules`.

## Pantallas

- `/pagos` — `fees.view` para consultar. `fees.pay` para marcar pagado. `fees.revert` para corregir.
- El año vuelve a consultar la API. Mes, estado, afiliado y medio se filtran en el navegador.
- La selección de varias cuotas solo aparece si el parámetro está activo, y solo entre cuotas del mismo afiliado. Si está apagado, cada cuota se marca desde su acción.
- Antes de confirmar se muestra el desglose (base, recargo y total) calculado con `src/rules`. Corregir pide una nota y muestra el valor que se revierte.
- Quien no tiene el permiso no ve la acción. La API responde 403.

## API

- `GET /api/fees?year=` — `fees.view`. Ejecuta `ensureFeesUpToDate` y devuelve las cuotas del año, el parámetro de varias cuotas, el porcentaje de recargo y los medios activos.
- `POST /api/fees/pay` — `fees.pay`. Una transacción. 409 si alguna ya está pagada, si son de afiliados distintos o si el parámetro no permite varias. 400 si la fecha es futura o el medio no está activo.
- `POST /api/fees/[id]/revert` — `fees.revert`. Nota obligatoria. Limpia lo congelado y deja la cuota en Pendiente o Moroso.
- `GET /api/cron/fees` — `Authorization: Bearer CRON_SECRET`. Sin cookie. `middleware.ts` deja pasar esa ruta para que el secreto lo valide el handler. Horario en `vercel.json`: `10 5 * * *` (00:10 en Colombia).
- `GET /api/members/[id]` también ejecuta `ensureFeesUpToDate` antes de armar la ficha. El recargo de las cuotas sin pagar sale de `resolveFeeCharge`. `GET /api/dashboard` queda para el módulo 8 y debe llamar el mismo servicio.

Sin sesión, `GET /api/fees` responde 401. Sin el secreto, el cron responde 401.

## Datos

Sin migración. Usa `Fee` de `0001_init`.

La mensual del año es la de `periodYear`. La de ingreso entra en el año de su fecha de afiliación. Si sigue sin pagar, también aparece en el año en curso para que la deuda no quede oculta.

Bitácora: `fee.pay` y `fee.revert` por cuota. `fee.generate` del cron es una sola entrada por ejecución, con la cantidad creada y las que pasaron a morosas (`userId` vacío). Si la consulta crea cuotas, deja una entrada con el usuario. El alta de un afiliado sigue dejando una por cuota.

## Reglas aplicadas

Sin fórmulas nuevas. Usa `quoteMonthlyFee`, `periodDates`, `canGenerateMonthlyFee`, `resolveUnpaidStatus`, `resolveFeeCharge`, `freezePayment` e `isValidPaymentDate`.

- SMMLV $1.000.000 y perfil 1,70 % → cuota plena $17.000. Afiliarse el 16, si es la primera, → $8.500.
- SMMLV en 0 → no se genera ninguna cuota. Las existentes se pueden pagar y sí pasan a morosas.
- Cuota de octubre, holgura 3: el 3 de noviembre sigue pendiente; el 4 pasa a morosa.
- Pagada en diciembre con recargo 0,50 %: $17.000 + $10.000 = $27.000, y ese total queda congelado.
- La de ingreso no lleva recargo. Varias cuotas no se fusionan.
- `createMany` con `skipDuplicates` evita duplicar el mes si dos peticiones llegan juntas.

## Decisiones

- Un feature `fees` y un módulo de servidor. `/pagos` reemplaza el `ModulePlaceholder`.
- El desglose del diálogo usa `previewPayment` → `resolveFeeCharge`. El servidor lo vuelve a calcular al guardar.
- Excel sale de `DatatableLocal` con las columnas de §10.10 (número, nombre, periodo, tipo, base, recargo, total, estado, fecha límite, medio y fecha de pago). La casilla de selección no es una columna exportada.
- No se abre `/beneficios/entregas`.
- La ficha del afiliado solo recibió la llamada a `ensureFeesUpToDate` y el recargo en vivo. El resto del módulo 5 no se reabrió.

## Verificación

- [x] lint (`npm run lint`, Node 22)
- [x] test: 199 pruebas, incluidas `fees.schema.test.ts`, `fees.service.test.ts` (cuota $17.000 / $8.500, SMMLV 0, mora 3 y 4 de noviembre, cron, pago $27.000, varias cuotas, 409, reversión) y `feesService.test.ts`
- [x] API sin sesión: `GET /api/fees` responde 401. `/pagos` cae en `/login`. El cron sin secreto responde 401
- [ ] recorrido en navegador con sesión: feliz, vacío, error, sin permiso
- [x] checklist UI en código: `DatatableLocal`, campos `shared/ui/mui`, botones `customButtons`, `AppDialog`, estado con texto
- [x] auditoría: sin CRITICAL ni MAJOR

## Cómo retomar

El índice está en `docs/features/README.md`. Siguiente módulo: **7 Entregas**. No reabrir este módulo salvo un bug o el recorrido con sesión.
