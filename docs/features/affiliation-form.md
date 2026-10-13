# Formulario de afiliación (PDF)

- Requerimiento: REQUERIMIENTOS.md §2, §9.10, §10.1, §10.2, §10.11, §13 módulo 10
- Estado: especificado, sin código

## Qué resuelve

Descargar un PDF imprimible con los datos del alta, casilla de tratamiento de datos personales, firmas y declaraciones (voluntariedad, mora sin efecto crediticio, condiciones de beneficios). No sustituye el registro por ventanilla.

## Pantallas

- `/` — botón «Descargar formulario de afiliación» en Cómo afiliarse (sin sesión).
- `/login` — el mismo enlace o botón, sin sesión, para imprimir en ventanilla.

## API

- `GET /api/public/affiliation-form` (nombre tentativo) — sin sesión. Middleware público. Respuesta PDF. Sin parámetros de afiliado.

## Datos

Sin migración prevista. Lee `Settings` (y opcionalmente beneficios públicos). No escribe `Member`.

## Reglas aplicadas

Ninguna fórmula de cuota. El PDF solo informa que hay condiciones de beneficios; la elegibilidad sigue en `src/rules/benefits` al entregar.

## Decisiones (abiertas al implementar)

- Sustituir el placeholder **leyes XYZ** por el texto legal que indique la asociación.
- Generar el PDF en el servidor vs. archivo estático versionado.
- Si el resumen de beneficios públicos va dentro del PDF o solo se remite a la página.

## Verificación

- [ ] lint
- [ ] test
- [ ] recorrido: descarga desde `/` y `/login`, PDF con campos, check, firmas y declaraciones
- [ ] checklist UI
- [ ] auditoría sin CRITICAL/MAJOR
- [ ] e2e si se toca middleware

## Cómo retomar

Ver `docs/features/README.md`. No reabrir módulos 0–9 salvo un bug.
