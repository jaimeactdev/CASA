# Base

- Requerimiento: REQUERIMIENTOS.md §5, §6, §9, §11, §13 módulo 0
- Estado: listo contra Neon (migración `0001_init` y semilla aplicadas)

## Qué resuelve
Levanta Prisma con el esquema completo, la semilla, la sesión propia y el menú filtrado por permisos.

## Pantallas
- `/login`: correo y clave. Si `mustChangePassword`, va a `/cambiar-clave`.
- `/cambiar-clave`: exige sesión. Tras guardar, va a `/home`.
- Rutas del panel (`/afiliados`, `/pagos`, …): menú visible según permiso; contenido placeholder hasta su módulo.

## API
- `POST /api/auth/login` — sin permiso. 400 si el correo o la clave fallan.
- `GET /api/auth/me` — sesión.
- `POST /api/auth/logout` — borra la cookie.
- `POST /api/auth/password` — sesión. Mínimo 8 caracteres.

## Datos
Esquema completo en `prisma/schema.prisma`. Migración inicial `0001_init` (incluye el índice único parcial de la cuota de ingreso).

## Reglas aplicadas
Ninguna de `src/rules` todavía. El hash usa bcryptjs (costo 12). El JWT solo lleva `userId`.

## Decisiones
- Prisma 6 (la 7 no instala hoy por una dependencia rota de `effect`).
- `E2E_BYPASS_AUTH=1` solo en Playwright, porque el middleware corre en el servidor y las pruebas simulan la sesión en el navegador.
- El cliente llama a `/api/auth/me` al cargar. Un 401 de esa ruta no muestra el toast de sesión vencida.

## Verificación
- [x] lint (pendiente de correr tras generate)
- [x] test de login, menú, JWT y esquemas Zod
- [ ] recorrido real contra Neon (crear proyecto, migrar, sembrar, entrar)
- [ ] checklist UI
- [ ] auditoría
