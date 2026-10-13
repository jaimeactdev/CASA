# Página pública

- Requerimiento: REQUERIMIENTOS.md §5.5, §5.8, §7, §10.1, §13 módulo 9
- Estado: listo y cerrado en `jact`

## Qué resuelve

Explica la afiliación por ventanilla y lista los beneficios que la asociación marcó como públicos. No muestra afiliados, documentos, teléfonos de personas ni pagos.

## Pantallas

- `/` — sin sesión y sin shell. El nombre y la ciudad salen de `Settings`.
- Presentación: la asociación acompaña a sus afiliados y atiende en la ciudad configurada.
- Beneficios activos con `isPublic` y texto público. El auxilio de lentes no sale.
- Cómo afiliarse: cualquier persona, por ventanilla, aporte según el perfil, servicios en esa ciudad. No hay formulario.
- Contacto: teléfono, correo, dirección y horario. Si los cuatro están vacíos, la sección no se muestra.
- «Ingreso del personal» lleva a `/login`.

## API

- `GET /api/public/site` — sin sesión y sin permiso. El middleware la deja pasar, igual que el ingreso. No acepta parámetros: uno de más responde 400.
- Devuelve nombre, sigla, ciudad, contacto y los beneficios públicos (`id`, `name`, `publicText`). No incluye el SMMLV ni la descripción interna.

## Datos

Sin migración. Lee `Settings` y `Benefit`.

## Reglas aplicadas

Sin fórmulas nuevas. Un beneficio público con texto en blanco no se publica. Uno inactivo tampoco, aunque tenga `isPublic`.

## Decisiones

- El feature y el módulo de servidor se llaman `site`. La ruta sigue siendo `GET /api/public/site`.
- El texto de presentación y de afiliación es fijo e inserta el nombre y la ciudad. No se agregó un campo nuevo a `Settings`.
- La pestaña usa `appConfig.fullName` (`NEXT_PUBLIC_APP_*`). El título de la página usa el nombre guardado en parámetros.
- Se quitó el `RootRedirect` que mandaba `/` a `/home`. Era el placeholder de esta ruta.
- `middleware.ts` solo sumó `/api/public/site` a las rutas públicas. El resto del módulo 0 no se tocó.
- `next build` (lo exige el e2e) no compilaba: el target pasó de ES2017 a ES2022 por el literal `10_000n`; los select conservan su genérico al exportarse; `markFeePaid` y el audit de parámetros usan el input unchecked de Prisma; `requireSettings` de afiliados usa el cliente por defecto.

## Verificación

- [x] lint (`npm run lint`, Node 22.23.3, sin avisos)
- [x] test: 251 pruebas. Nuevas: `site.schema.test.ts`, `site.service.test.ts` (solo campos públicos, texto en blanco, parámetros ausentes) y `siteService.test.ts` (mapeo, auxilio sin texto, contacto vacío o parcial, ciudad)
- [x] `GET /api/public/site` responde 200 sin cookie. Un parámetro de más responde 400. En la base de desarrollo salen los cuatro beneficios públicos y no el auxilio de lentes
- [x] recorrido en navegador: presentación, beneficios, cómo afiliarse, contacto (porque los parámetros ya tienen datos) y el enlace a `/login`. En ancho de teléfono los beneficios quedan en una columna
- [x] checklist UI: botón `customButtons.ghost` píldora, cards 16px, presentación 24px, colores de `designTokens`
- [x] auditoría: sin CRITICAL ni MAJOR. La ruta pública no pide sesión porque así está en §5.5; el cuerpo no trae datos de afiliados
- [x] e2e: 9 pruebas (`npm run test:e2e`, Node 22.23.3). `/` permanece sin sesión; el panel sigue yendo a `/login`. El inicio con sesión simulada espera el encabezado Inicio y un `GET /api/dashboard` simulado

## Cómo retomar

El índice está en `docs/features/README.md`. El siguiente módulo de construcción es el 10 (formulario PDF). No reabrir este módulo salvo un bug.
