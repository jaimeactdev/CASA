# Reglas

- Requerimiento: REQUERIMIENTOS.md §5.7, §7.1, §8, §13 módulo 1
- Estado: listo (el servidor aún no las consume)

## Qué resuelve
Deja las fórmulas de dinero, calendario de Colombia, cuota, recargo y elegibilidad de beneficios en `src/rules`, puras y con pruebas. El valor que se guarda lo calculará el servidor cuando existan esos módulos.

## Pantallas
Ninguna. Este módulo no tiene UI.

## API
Ninguna. Este módulo no expone rutas.

## Datos
No toca Prisma ni migraciones.

## Reglas aplicadas
- `money.ts`: `roundPesos` (50 centavos hacia arriba) y `applyPercent` con enteros escalados. SMMLV $1.000.000 al 1,70% = $17.000; recargo 0,50% = $5.000.
- `calendar.ts`: `todayInBogota(now)`, último día del mes, holgura y meses calendario. "Hoy" entra como parámetro; zona `America/Bogota`.
- `fees.ts`: cuota plena, primera cuota reducida (día 16 o después al 50%), estados, recargo (octubre: 3 nov Pendiente / 4 nov 1 mes / 1 dic 2 meses → $27.000), cuota de ingreso sin mora, generación solo del mes en curso para Activos.
- `benefits.ts`: `evaluateBenefit` con las seis condiciones del §8.6. La 5 (cupo del año) no admite excepción. "No indica" no coincide con solo mujeres ni solo hombres. El paseo con mínimo 0 y `requiresMinimumSetup` se bloquea en entrega normal.

## Decisiones
- Los porcentajes entran como centésimas enteras (`1.70` → `170`) para no usar `number` con decimales. El servidor convertirá `Prisma.Decimal` con `toPercentHundredths`.
- Las fechas de negocio son `{ year, month, day }`, no `Date` local del servidor.
- No hay `index.ts`: cada consumidor importa el archivo del área.

## Verificación
- [x] lint
- [x] test: `money.test.ts`, `calendar.test.ts`, `fees.test.ts`, `benefits.test.ts` (ejemplos del §7.1 y §8)
- [x] recorrido: no aplica (sin pantallas)
- [x] checklist UI: no aplica
- [x] auditoría: sin CRITICAL ni MAJOR (capa `rules` solamente)
