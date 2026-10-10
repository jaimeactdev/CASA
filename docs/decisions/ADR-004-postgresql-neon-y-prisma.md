# ADR-004 — PostgreSQL en Neon con Prisma

- Estado: aceptado
- Fecha: 2026-10-09

## Contexto

Hace falta una base relacional gratuita, que conserve los datos de forma permanente y funcione con funciones serverless de Vercel.

## Decisión

- **Base de datos:** PostgreSQL en Neon, plan gratuito, región AWS `us-east-1`, la misma de las funciones de Vercel (`iad1`).
- **Acceso a datos:** Prisma ORM. El esquema está en `prisma/schema.prisma` y las migraciones versionadas en `prisma/migrations/`.
- **Dos conexiones:**
  - `DATABASE_URL`, con *pooler* (host `-pooler`): la usa la aplicación. Vercel abre muchas conexiones cortas y el pooler las reparte.
  - `DIRECT_URL`, sin pooler: la usa Prisma para migrar.
- **Ramas de Neon:**
  - `main`: producción. La usa Vercel en Production.
  - `dev`: desarrollo local y vistas previas. Se puede reiniciar desde `main` cuando haga falta.
- **Flujo de cambios de esquema:**
  1. Editar `schema.prisma`.
  2. `npx prisma migrate dev --name <cambio>` contra `dev`. Genera el SQL en `prisma/migrations/`.
  3. Commit y push.
  4. El build de Vercel ejecuta `prisma generate && prisma migrate deploy && next build`. Aplica en `main` solo las migraciones pendientes.
- **Semilla:** `prisma/seed.ts`, idempotente con `upsert`. Crea permisos, roles, configuración, medios de pago, beneficios, el perfil General y el primer administrador desde `ADMIN_EMAIL` y `ADMIN_PASSWORD`. Se ejecuta con `npx prisma db seed`.
- **Respaldo:** GitHub Action semanal (domingo) que corre `pg_dump` sobre `DIRECT_URL` de `main` y guarda el archivo como artefacto privado por 90 días. Al menos una vez, restaurarlo en una rama de Neon para comprobar que sirve.
- **Prohibido** cambiar tablas a mano en producción. Todo cambio pasa por migración.

## Consecuencias

- Neon apaga la computación tras unos 5 minutos sin uso. La primera consulta después tarda un poco más, y los datos no se pierden.
- La restauración de Neon en el plan gratuito cubre pocas horas hacia atrás. El respaldo semanal propio es obligatorio.
- El volumen esperado (cientos de afiliados, miles de cuotas al año) cabe de sobra en el almacenamiento gratuito. Los límites exactos se revisan en la página de precios de Neon al crear el proyecto.
- Dependencias que entran con el primer módulo de datos: `prisma`, `@prisma/client`, `zod`.
