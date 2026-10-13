# Formulario de afiliación (PDF)

- Requerimiento: REQUERIMIENTOS.md §2, §5.8, §9.10, §10.1, §10.2, §10.11, §13 módulo 10
- Estado: especificado, sin código

## Qué resuelve

Descargar un PDF imprimible con los datos del alta, la autorización de tratamiento de datos personales, firmas y declaraciones: afiliación voluntaria, retiro y fin de pagos cuando quiera, sin reportes a centrales de riesgo y beneficios con condiciones. No sustituye el registro por ventanilla.

## Pantallas

- `/`: botón «Descargar formulario de afiliación» en Cómo afiliarse, sin sesión.
- `/login`: el mismo botón, sin sesión, para imprimir en ventanilla.

## API

- `GET /api/public/affiliation-form` (nombre tentativo): sin sesión, con middleware público y query validada con Zod (sin parámetros). Responde un PDF y no recibe ni devuelve datos de afiliados.

## Datos

Sin migración prevista. Lee `Settings` y, opcionalmente, los beneficios públicos. No escribe `Member`.

## Contenido legal (definido)

- Norma: Ley Estatutaria 1581 de 2012 y Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015). Autoridad: Superintendencia de Industria y Comercio.
- Casilla **sin marcar**, en bloque separado, con el texto fijo de §10.11. Incluye finalidades, derechos del titular, revocación y que los datos no se reportan a centrales de riesgo.
- Espacio de firma del representante legal si el solicitante es menor de edad.
- La asociación **no** reporta a centrales de riesgo ni consulta historiales crediticios. El PDF lo dice en las declaraciones. No se cita la Ley 1266 de 2008 porque no aplica: no hay reportes.
- El papel firmado se guarda como prueba de la autorización.

## Reglas aplicadas

Ninguna fórmula de cuota. El PDF solo informa que hay condiciones de beneficios; la elegibilidad sigue en `src/rules/benefits` al entregar.

## Decisiones abiertas al implementar

- Generar el PDF en el servidor con una librería (con ADR) o servir un archivo fijo versionado.
- Si el resumen de beneficios públicos va dentro del PDF o solo se remite a la página.
- Revisión del texto legal por un abogado antes de imprimir en producción. No bloquea el código.

## Verificación

- [ ] lint
- [ ] test
- [ ] recorrido: descarga desde `/` y `/login`, PDF con campos, casilla sin marcar, firmas (con representante legal) y declaraciones
- [ ] checklist UI
- [ ] auditoría sin CRITICAL/MAJOR
- [ ] e2e (se toca `middleware.ts`)

## Cómo retomar

Ver `docs/features/README.md`. No reabrir los módulos 0 a 9 salvo un bug.
