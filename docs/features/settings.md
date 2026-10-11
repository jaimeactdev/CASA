# Parámetros

- Requerimiento: REQUERIMIENTOS.md §7, §9.3, §9.4, §10.9, §12.5, §13 módulo 2
- Estado: listo (código y pruebas). Recorrido con sesión real pendiente de `ADMIN_*` / semilla en este entorno.

## Qué resuelve
Permite ver y editar la fila única de `Settings` y administrar los medios de pago, con confirmación y bitácora cuando cambia el SMMLV o el recargo. La vista previa muestra la cuota de cada perfil activo: SMMLV × porcentaje del perfil.

## Pantallas
- `/parametros` — permiso `settings.view` para entrar (el menú ya lo filtraba). `settings.edit` para guardar, crear o activar/inactivar medios. Sin `settings.edit` el formulario queda en solo lectura y no muestra las acciones.
- El 1,70% **no** se edita aquí: es `MembershipProfile.percent` y se administra en `/perfiles` (módulo 4). Aquí solo se lee para la preview.

## API
- `GET /api/settings` — `settings.view`. Devuelve la fila, **todos** los medios (activos e inactivos) y los perfiles activos `{ id, name, percent }` para la preview. Extra de implementación; el contrato de REQUERIMIENTOS sigue siendo “parámetros”.
- `PATCH /api/settings` — `settings.edit`. Valida con Zod (§9.3). Transacción: actualiza la fila y escribe `settings.update`. **No toca cuotas.**
- `GET /api/payment-methods` — sesión. Solo medios **activos**, para cobrar más adelante.
- `POST /api/payment-methods` — `settings.edit`. Crea. 409 si el nombre ya existe.
- `PATCH /api/payment-methods/[id]` — `settings.edit`. Edita nombre, orden o `isActive`. No hay borrado físico.

## Datos
Sin migración. Usa `Settings` (id = 1) y `PaymentMethod` de `0001_init`. Bitácora: entidades `settings` y `payment_method`.

## Reglas aplicadas
- No hay fórmulas nuevas. La preview usa `quoteFullFee` y `applyPercent` de `src/rules` con los perfiles activos y los valores del formulario (se actualiza al escribir).
- Ejemplo de prueba: SMMLV $1.000.000, perfil 1,70% → cuota plena $17.000; primera cuota 50% → $8.500; recargo 0,50% → $5.000/mes (sobre el SMMLV, no sobre la cuota).
- Al cambiar SMMLV o recargo, la UI muestra valor anterior → nuevo antes de confirmar (§10.9).
- El porcentaje de recargo vigente afecta cuotas morosas aún no pagadas; las ya generadas conservan su SMMLV (§7, §8.2). Eso lo aplicarán los módulos de cuotas; aquí solo se guarda el parámetro.

## Decisiones
- Feature y módulo de servidor: `settings`. La ruta de pantalla sigue en español (`/parametros`).
- Los decimales viajan como texto `"50.00"` / `"0.50"` para no usar `number` con decimales.
- `HttpRequestProvider` ahora tiene `patch` y traduce 409, porque el contrato de la API usa PATCH.
- `DatatableLocal` lleva `'use client'` (sin eso `/parametros` rompía con `SettingsView` undefined / `.call`).
- `InputFieldMUI`: el wrapper flex ahora tiene `width: "100%"` para que el campo no se encoja al texto. Los wrappers de `/parametros` usan `display: "block"` sobre `grid6md` / `grid12md`.
- Copy de cuotas (no son lo mismo):
  - **Día de corte:** no genera la cuota. Solo decide si la primera mensualidad sale reducida.
  - **% de la primera cuota:** % de la cuota plena del perfil, solo esa primera mensualidad si el día de afiliación es posterior al corte.
  - **% de recargo mensual:** % del SMMLV por cada mes de atraso. No es % de la cuota. El requerimiento dice *mensual*, no *manual*.
  - **Cuota única de ingreso:** cobro global al afiliar si es > 0. No es la cuota mensual ni un % de perfil.
- Cada perfil tiene su propia cuota mensual. No hay una sola cuota para todos.
- El listado de medios usa `DatatableLocal` (estado `A`/`I` mapeado en `data`/`domain`). Sin Excel: no está en §10.10.

## Verificación
- [x] lint
- [x] test: `settings.schema.test.ts`, `settings.service.test.ts` (cambio de SMMLV/recargo en bitácora), `settingsService.test.ts` (validación, confirmación, preview $17.000)
- [x] API sin sesión: `GET /api/settings` y `GET /api/payment-methods` responden 401
- [ ] recorrido en navegador con sesión: feliz, error de formulario, rol sin `settings.edit`, 403 de la API (login admin 400 en este entorno; falta sembrar o corregir `ADMIN_*` en `.env.local`)
- [x] checklist UI en código: campos `shared/ui/mui`, botones `customButtons`, papers 16px, estados con texto
- [x] auditoría: sin CRITICAL ni MAJOR

## Cómo retomar
El índice de continuidad está en `docs/features/README.md`. Siguiente módulo: **3 Usuarios y roles**. No reabrir este módulo salvo un bug o el recorrido con sesión.
