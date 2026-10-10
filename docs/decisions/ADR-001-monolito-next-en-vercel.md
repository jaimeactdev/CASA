# ADR-001 — Monolito Next.js en Vercel

- Estado: aceptado
- Fecha: 2026-10-09

## Contexto

La plantilla venía como frontend estático (`output: "export"`) servido por IIS o nginx, con pipeline de Azure y un API externo.

CASA necesita servidor: sesión propia, reglas de cuota y recargo, base de datos y un proceso diario. El presupuesto es cero.

## Decisión

- Una sola aplicación Next.js (App Router) con frontend y backend juntos, desplegada en Vercel (plan Hobby).
- Sin exportación estática, sin `basePath` y sin `trailingSlash`.
- Se eliminan `azure-pipeline.yml`, `Dockerfile`, `web.config`, `public/web.*.config` y la carpeta `out/`.
- Vercel construye desde GitHub: cada `push` a `main` publica en producción, y cada rama genera una vista previa.
- El cron diario de Vercel llama `GET /api/cron/fees`. En Hobby corre una vez al día y sin hora exacta.

## Consecuencias

- Se pueden usar Route Handlers, middleware y cron.
- `npm run build` ya no genera `out/`. `npm start` sirve la app con `next start`.
- El cron no es puntual, así que la generación de cuotas también ocurre al consultar (ver `docs/REQUERIMIENTOS.md`).
- El plan Hobby es para uso no comercial. Si la asociación crece o se cobra por el servicio, se evalúa el plan Pro.
