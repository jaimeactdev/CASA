# ADR-003 — Backend en Route Handlers y capa `src/server`

- Estado: aceptado
- Fecha: 2026-10-09

## Contexto

La plantilla separa el frontend en features MVVM y concentra toda la I/O en `data/repositories`, a través de `HttpRequestProvider`. Esa regla funciona bien y no se quiere romper.

Hace falta un lugar para el código de servidor y otro para las reglas de cuota, recargo y beneficios. Ambos deben poder usarse sin duplicar fórmulas.

## Decisión

### Cómo habla el frontend con el servidor

- El backend expone Route Handlers bajo `src/app/api/**` y responde JSON.
- Los repositorios de cada feature los consumen con `HttpRequestProvider`, cuya URL base por defecto es `/api` (mismo dominio, cookie automática).
- No se usan Server Actions. Así, view, viewmodel y domain siguen sin conocer el transporte, como pide la plantilla.

### Estructura del servidor

```
src/app/api/<recurso>/route.ts      delgado: sesión, permiso, validación Zod, llamar al servicio
src/server/
  db/prisma.ts                       cliente Prisma único
  auth/                              cookie de sesión, hash de clave, requirePermission
  http/                              respuesta de error uniforme y validación
  modules/<modulo>/
    <modulo>.schema.ts               Zod: entrada de la API
    <modulo>.repository.ts           Prisma, sin reglas
    <modulo>.service.ts              casos de uso, transacciones y bitácora
```

- Todo archivo de `src/server/**` empieza con `import 'server-only'`, para que el build falle si el cliente lo importa.
- Respuesta de error: `{ message: string, errors?: string[] }`, que `apiErrorUtils` ya interpreta.

### Reglas de negocio puras

```
src/rules/
  money.ts        redondeo de pesos y porcentajes, sin punto flotante
  calendar.ts     hoy en America/Bogota, último día del mes, meses de atraso
  fees.ts         cuota plena, primera cuota reducida, estado, recargo, total
  benefits.ts     elegibilidad de un beneficio
```

- Solo TypeScript: sin React, sin Prisma, sin fetch. Cada archivo tiene su prueba en Vitest.
- Las usa el servidor para guardar y calcular. El frontend (`features/*/domain`) puede usarlas solo para previsualizar, por ejemplo el desglose antes de marcar "Pagó". El valor que se guarda siempre lo calcula el servidor.

### Dependencias permitidas

```
features/*  ->  rules, shared, core, styles, config
app/api/*   ->  server
server/*    ->  rules
rules/*     ->  (nada del proyecto)
```

`rules` no importa `features`, `server`, `shared` ni `core`.

## Consecuencias

- La regla "toda I/O remota en `data/`" sigue vigente: el "remoto" es nuestro `/api`.
- Se agrega Zod. Los esquemas de entrada viven en el servidor. El frontend valida con funciones de su `domain`, igual que el feature `form`.
- Cada módulo nuevo toca `features/<modulo>`, `app/api/<recurso>` y `server/modules/<modulo>`.
