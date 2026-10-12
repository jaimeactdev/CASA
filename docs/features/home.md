# Inicio

- Requerimiento: REQUERIMIENTOS.md §5.5, §5.6, §8.2, §10.3, §13 módulo 8
- Estado: listo (código y pruebas). Recorrido con sesión pendiente.

## Qué resuelve

Muestra en `/home` el resumen del día: afiliados activos, activos en mora, cuotas pendientes del mes, cuotas morosas, el aviso si el SMMLV está en 0 y el recordatorio del beneficio del mes. Los accesos dependen del rol.

## Pantallas

- `/home` — solo sesión. Cuatro conteos. Si el salario mínimo está en 0, un aviso; el enlace «Ir a parámetros» aparece con `settings.view`.
- Si el mes coincide con el `suggestedMonth` de un beneficio activo, el texto es «Este mes corresponde a {nombre}.» En mayo, Día de la madre; en junio, Día del padre; en diciembre, Aguinaldo. Un beneficio inactivo no sale.
- Accesos: Afiliados (`members.view`), Pagos (`fees.view`) y Entregas (`benefits.view` → `/beneficios/entregas`). Quien no tiene ninguno ve que su rol no incluye esos accesos. El conteo sí se muestra: la ruta no pide un permiso de módulo.

## API

- `GET /api/dashboard` — sesión (`requireSession`), sin permiso de módulo, igual que el requerimiento. No acepta parámetros. Llama `ensureFeesUpToDate` antes de contar. Devuelve la fecha de negocio, el año, el mes, el SMMLV, los cuatro conteos y los recordatorios.
- Sin sesión, el middleware responde 401 y `/home` redirige a `/login`. Con sesión, un parámetro de más responde 400.

## Datos

Sin migración. Lee `Member`, `Fee`, `Settings.minimumWage` y `Benefit.suggestedMonth`.

La mora del afiliado no se guarda: es un conteo de afiliados activos con al menos una cuota mensual en `OVERDUE`. La cuota de ingreso no entra. Las cuotas morosas de un suspendido o retirado sí entran en el conteo de cuotas y no en el de activos en mora.

## Reglas aplicadas

Sin fórmulas nuevas. El mes sale de `todayInBogota` y `yearMonthOf`. El estado de las cuotas ya lo dejó `ensureFeesUpToDate` con `resolveUnpaidStatus`.

- Mayo, beneficio activo con mes 5: recordatorio de Día de la madre. Junio y diciembre, igual con Día del padre y Aguinaldo.
- Octubre, sin beneficio de ese mes: sin recordatorio.
- SMMLV en 0: igual se sincronizan las cuotas y se devuelven los conteos, con el salario en 0.
- Si la sincronización falla, no se leen los conteos.

## Decisiones

- El feature sigue en `home`. El módulo de servidor también se llama `home`. La ruta de API queda `/api/dashboard`, como en el requerimiento.
- No hay permiso nuevo. Agregar uno cambiaría el catálogo de la sección 6, y el inicio es de cualquier persona del personal que ya entró.
- Comparar `suggestedMonth` con el mes de negocio no es una fórmula de cuota ni de elegibilidad, así que no se duplicó en `src/rules`.
- «Cuotas pendientes del mes» son las mensuales del periodo en curso en Pendiente. «Cuotas morosas» son las mensuales en Moroso, de cualquier periodo.
- El cliente no calcula los conteos: los pinta como llegan. Los accesos se arman con los permisos que ya están en la sesión del navegador.
- No se abrió `/`. Los módulos 0 a 7 no se reescribieron.

## Verificación

- [x] lint (`npm run lint`, Node 22.23.3, sin avisos)
- [x] test: 242 pruebas. Nuevas: `home.schema.test.ts`, `home.service.test.ts` (sincroniza antes de contar, mayo/junio/diciembre, mes sin recordatorio, SMMLV en 0, parámetros ausentes, fallo de la sincronización) y `homeService.test.ts` (mapeo, texto del recordatorio, accesos y enlace a parámetros)
- [x] sin sesión: `GET /api/dashboard` responde 401 y `/home` redirige a `/login` (307). El navegador en `http://127.0.0.1:4200/home` cae en el ingreso del personal
- [ ] recorrido en navegador con sesión: conteos, SMMLV en 0 con y sin `settings.view`, recordatorio del mes, accesos según el rol, error de la API
- [x] checklist UI en código: botones `customButtons` píldora, cards con radio 16px, colores de `designTokens`, mora y pendiente con texto
- [x] auditoría: sin CRITICAL ni MAJOR

## Cómo retomar

El índice está en `docs/features/README.md`. Siguiente módulo: **9 Página pública**. No reabrir este módulo salvo un bug o el recorrido con sesión.
