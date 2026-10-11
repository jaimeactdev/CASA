# CASA

**Círculo de Apoyo y Servicios para Afiliados.** Gestión de afiliados por ventanilla, cuotas mensuales, mora y beneficios de una asociación en Medellín.

Qué hace y cómo se calcula cada valor: **[docs/REQUERIMIENTOS.md](docs/REQUERIMIENTOS.md)**.

## Stack

- Next.js 15 (App Router) como monolito en Vercel: pantallas y API en la misma app
- React 19 + TypeScript
- MUI 7 + PrimeReact
- Zustand + TanStack Query
- PostgreSQL en Neon + Prisma
- Sesión propia: correo y clave, cookie HttpOnly con JWT (`jose`, `bcryptjs`)
- Vitest + Playwright

Decisiones: [docs/decisions/](docs/decisions/).

## Arranque local

Requiere Node 22.

```bash
cp .env.example .env.local   # completar DATABASE_URL, DIRECT_URL (rama dev de Neon) y AUTH_SECRET
npm install
npm run dev
```

La app corre en [http://localhost:4200](http://localhost:4200).

## Variables de entorno

Ver `.env.example`.

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_APP_*` | Nombre, tagline, descripción SEO |
| `NEXT_PUBLIC_BRAND_COLOR` | Color primario (por defecto `#1E5631`) |
| `NEXT_PUBLIC_BACKEND_URL_BASE` | Base del API en el cliente (`/api`) |
| `NEXT_PUBLIC_SESSION_TIMEOUT_*` | Timeout de inactividad |
| `NEXT_PUBLIC_SITE_URL` | Canonical SEO y sitemap |
| `DATABASE_URL` / `DIRECT_URL` | Neon: conexión con pooler / directa para migraciones |
| `AUTH_SECRET` | Firma del JWT de sesión |
| `CRON_SECRET` | Protege `/api/cron/fees` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Primer administrador (semilla) |

Las variables sin `NEXT_PUBLIC_` solo existen en el servidor.

## Estructura

```
prisma/                # schema, migraciones, semilla
src/
  middleware.ts        # sesión obligatoria en el panel
  app/                 # páginas (page.tsx público, (panel)/ con shell) y api/
  features/            # frontend por módulo (MVVM)
  rules/               # fórmulas puras de cuota, recargo y beneficios
  server/              # Prisma, sesión, permisos, servicios (server-only)
  core/                # HTTP del cliente, guards, stores, excepciones
  providers/           # Query, Theme
  shared/              # UI kit, layouts, hooks, utils
  styles/              # theme y tokens
  config/              # appConfig (identidad)
  environments/        # ENV del cliente
e2e/                   # Playwright
docs/                  # requerimientos, ADR, arquitectura, UI kit, prompts
```

Guía completa: **[docs/README.md](docs/README.md)**.

## Pruebas

```bash
npm run lint
npm test          # unitarias (Vitest)
npm run test:e2e  # recorrido de sesión (Playwright)
```

Reglas visuales mínimas: botones **píldora** (`theme.customButtons` / `HoverIconButton`), campos de `src/shared/ui/mui` (radio 20px), colores desde `src/styles/designTokens.ts`. Detalle en [docs/ui-kit.md](docs/ui-kit.md).

## Base de datos (Neon)

No hay que instalar PostgreSQL en el computador. Neon vive en la nube y Prisma habla con ella.

1. Crea una cuenta en [neon.tech](https://neon.com) (plan Free).
2. Crea un proyecto en AWS `us-east-1` y una rama `dev`.
3. Copia las dos URLs (pooled → `DATABASE_URL`, direct → `DIRECT_URL`) en `.env.local`.
4. Genera `AUTH_SECRET` (`openssl rand -base64 32`) y define `ADMIN_EMAIL` / `ADMIN_PASSWORD` (mínimo 8 caracteres).
5. Aplica el esquema y la semilla:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Neon **no borra los datos** si dejas de entrar. Solo apaga el cómputo a los 5 minutos; la siguiente consulta lo despierta. Eso es distinto de MongoDB Atlas gratuito, que pausa el cluster a los 30 días sin conexiones.

```bash
npx prisma migrate dev --name <cambio>   # solo contra la rama dev, cuando cambie el esquema
npx prisma db seed                        # se puede repetir: no duplica
```

## Publicación (Vercel)

- Repositorio en GitHub conectado a Vercel. Cada push a `main` publica.
- Build: `prisma generate && prisma migrate deploy && next build`, que aplica las migraciones pendientes a producción.
- Variables de servidor en el panel de Vercel, con la rama `main` de Neon.
- Cron diario `/api/cron/fees` en `vercel.json`.
- Respaldo semanal con `pg_dump` (GitHub Actions).

Paso a paso: `docs/REQUERIMIENTOS.md`, sección 14.
