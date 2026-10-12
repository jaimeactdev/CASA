# Entregas

- Requerimiento: REQUERIMIENTOS.md §8.6, §9.12, §9.13, §10.6, §10.10, §12.4, §13 módulo 7
- Estado: listo (código y pruebas). Recorrido con sesión pendiente.

## Qué resuelve

Deja registrar que un afiliado recibió un beneficio, con la evaluación de `src/rules`, y anular esa entrega si fue un error. El cupo del año solo cuenta las que siguen vigentes.

## Pantallas

- `/afiliados`, en la ficha: quien tiene `benefits.deliver` o `benefits.deliver_exception` ve «Registrar entrega» en cada beneficio del perfil. El diálogo lista las seis condiciones (Cumple / No cumple). Si el paseo sigue con mínimo 0, el aviso dice que falta definir cuántas cuotas exige.
- La fecha de la ficha tiene que caer en el año en curso y no puede ser futura, porque las reglas que se muestran son las de ese año. La nota es obligatoria solo cuando la entrega es excepción.
- Si ya no hay cupo, el diálogo no confirma y remite a anular en Entregas.
- Quien solo tiene el permiso normal no puede confirmar una excepción. Quien no tiene ninguno no ve el botón.
- `/beneficios/entregas` — `benefits.view`. El año vuelve a consultar la API. Beneficio, afiliado, anulada y búsqueda se filtran en el navegador.
- Anular (`benefits.void_delivery`) pide una nota y muestra quién entregó. Quien no tiene el permiso no ve la acción. La API responde 403.

## API

- `GET /api/benefit-deliveries?year=&benefitId=&memberId=` — `benefits.view`. Devuelve las entregas del año y el catálogo para el filtro. Sin año, usa el año de negocio.
- `POST /api/benefit-deliveries` — `benefits.deliver` o `benefits.deliver_exception`. Una transacción. El servidor decide si es excepción. 400 si la fecha es futura o si falta la nota de la excepción. 403 si hace falta excepción y el rol no la tiene. 409 si el beneficio está inactivo o si el cupo del año ya se llenó. 404 si el afiliado o el beneficio no existen.
- `POST /api/benefit-deliveries/[id]/void` — `benefits.void_delivery`. Nota obligatoria. 409 si ya estaba anulada.
- `GET /api/members/[id]/benefits?year=` — `benefits.view`. Misma evaluación que la ficha, para el año pedido. También ejecuta `ensureFeesUpToDate`. La ficha sigue leyendo el año en curso dentro de `GET /api/members/[id]`.

Sin sesión, esas rutas responden 401 y `/beneficios/entregas` redirige a `/login`.

## Datos

Sin migración. Usa `BenefitDelivery` de `0001_init`.

No se borran entregas: se marcan `isVoided`. La anulada no entra en el conteo del cupo.

Bitácora: `benefit.deliver` y `benefit.void`, con nota cuando la hay. La de la entrega guarda las condiciones evaluadas.

Dentro de la transacción se bloquea la fila del afiliado y solo entonces se cuentan las vigentes del mismo beneficio y año. Así dos registros simultáneos no se pasan el cupo.

## Reglas aplicadas

Sin fórmulas nuevas. Usa `evaluateBenefit` y `countPaidMonthlyFeesInYear`.

- Aguinaldo, afiliado activo, perfil que lo incluye, sexo que coincide, mínimo 0 y sin entregas: se registra como entrega normal.
- La cuota de ingreso no suma. Una mensual pagada, aunque sea la reducida, sí suma un mes.
- Suspendido, sexo que no coincide o paseo con mínimo 0: el permiso normal responde 403. Con `benefits.deliver_exception` y nota, queda `isException`.
- La condición del cupo no admite excepción: la segunda entrega del mismo año responde 409.
- «No indica» no coincide con un beneficio solo de mujeres.
- Quien solo tiene el permiso de excepción, si todas las condiciones pasan, registra una entrega normal.
- Fecha futura: 400, sin abrir la transacción.

## Decisiones

- Un feature `deliveries` y un módulo de servidor. `/beneficios/entregas` reemplaza el `ModulePlaceholder`. El alta sale de la ficha, así que el repositorio de afiliados llama a `POST /api/benefit-deliveries`. La anulación vive en el feature de entregas.
- El cliente no envía `isException`. Lo calcula el servidor con `evaluateBenefit`.
- La API acepta cualquier fecha no futura y el año guardado es el de esa fecha. La ficha limita el calendario al año que está mostrando.
- Un beneficio inactivo no se entrega (409), ni con excepción.
- Excel sale de `DatatableLocal` con las columnas de §10.10 (número, nombre, beneficio, año, fecha, excepción, anulada) y, además, quién entregó y la nota, porque la ficha de la entrega debe mostrar quién la hizo.
- No se abrió `/` ni `/home`. El catálogo, las cuotas y el alta de afiliados no se reescribieron. La ficha solo sumó el resultado de la evaluación y la acción de registrar.

## Verificación

- [x] lint (`npm run lint`, Node 22.23.3, sin avisos)
- [x] test: 227 pruebas. Nuevas: `deliveries.schema.test.ts`, `deliveries.service.test.ts` (entrega normal, excepción, cupo, paseo en 0, sexo no indicado, cuota de ingreso que no suma, anulación, 404 y 409), `deliveriesService.test.ts`, `getMemberBenefits` en `members.service.test.ts` y la validación de la ficha en `membersService.test.ts`
- [x] API sin sesión: `GET /api/benefit-deliveries`, `GET /api/members/[id]/benefits` y `POST /api/benefit-deliveries/[id]/void` responden 401. `/beneficios/entregas` redirige a `/login`
- [x] el `SELECT … FOR UPDATE` del cupo se ejecutó contra la rama dev y el SQL es válido
- [ ] recorrido en navegador con sesión: feliz, vacío, error, sin permiso
- [x] checklist UI en código: `DatatableLocal`, campos `shared/ui/mui`, botones `customButtons`, `AppDialog`, estado con texto
- [x] auditoría: sin CRITICAL ni MAJOR

## Cómo retomar

El índice está en `docs/features/README.md`. Siguiente módulo: **8 Inicio**. No reabrir este módulo salvo un bug o el recorrido con sesión.
