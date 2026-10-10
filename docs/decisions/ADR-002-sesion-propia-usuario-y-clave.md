# ADR-002 — Sesión propia con usuario y clave

- Estado: aceptado
- Fecha: 2026-10-09
- Reemplaza: la regla de login con Microsoft Entra ID (MSAL) de la plantilla

## Contexto

Quienes entran son personal de la asociación, sin cuentas corporativas de Microsoft. Los roles y permisos se configuran desde la aplicación y viven en la base de datos.

La plantilla ya esperaba un servidor con `login`, `me` y `logout` y una cookie HttpOnly. Solo cambia quién emite la sesión.

## Decisión

- Login con correo y clave contra `POST /api/auth/login`.
- La clave se guarda con hash `bcryptjs` (costo 12). Nunca en texto plano.
- La sesión es un JWT firmado con `AUTH_SECRET` (librería `jose`), dentro de una cookie `casa_session`:
  - `HttpOnly`, `Secure` en producción, `SameSite=Lax`, `Path=/`.
  - Duración de 8 horas. El timeout de inactividad del cliente (30 minutos) cierra antes si no hay actividad.
  - El JWT solo lleva `userId` y la fecha de emisión. Rol y permisos se leen de la base en cada petición, para que un cambio de rol aplique de inmediato.
- `GET /api/auth/me` devuelve `{ id, name, email, rol, permissions, mustChangePassword }`. `POST /api/auth/logout` borra la cookie.
- Si `mustChangePassword` es verdadero (primer ingreso o clave asignada por el administrador), el panel redirige a `/cambiar-clave` hasta que se cambie con `POST /api/auth/password`.
- Credenciales incorrectas responden **400** con "Correo o clave incorrectos.", no 401. El 401 queda reservado para sesión vencida, porque el cliente HTTP lo usa para mostrar "Sesión finalizada".
- Protección en tres capas:
  1. `middleware.ts` redirige a `/login` si no hay cookie válida en las rutas del panel.
  2. Cada Route Handler exige sesión y el permiso de la acción (`requirePermission('fees.pay')`).
  3. En el cliente, `AuthGuard` y el menú ocultan lo que el usuario no puede usar. Esto es solo experiencia, no seguridad.
- El store del cliente guarda datos no sensibles del usuario (nombre, correo, rol y permisos) para pintar el menú. Nunca el token.

## Consecuencias

- Se eliminan `@azure/msal-*`, `MSALProviderWrapper`, `authConfig`, `TokenService`, `authStrategies` y el ícono de Microsoft.
- Dependencias que entran con el módulo de usuarios: `jose`, `bcryptjs`, `server-only`.
- No hay "olvidé mi clave" en esta versión. El administrador asigna una clave nueva.
