# Documento de módulo (CASA)

## Propósito
Un solo archivo por módulo que diga qué se construyó y cómo verificarlo. No reemplaza a `docs/REQUERIMIENTOS.md`: lo referencia. Sin historias de usuario (ADR-005).

## Ubicación y nombre
`docs/features/<modulo>.md`, en minúsculas y en inglés, igual que la carpeta del feature: `members.md`, `fees.md`, `benefits.md`.

## Contenido

```markdown
# <Nombre del módulo>

- Requerimiento: REQUERIMIENTOS.md §<secciones>
- Estado: en curso | listo

## Qué resuelve
Una o dos frases.

## Pantallas
Ruta, permiso y qué se puede hacer en cada una.

## API
Método, ruta, permiso y respuesta resumida.

## Datos
Modelos y migraciones que tocó.

## Reglas aplicadas
Funciones de `src/rules` que usa y casos borde que se probaron.

## Decisiones
Supuestos que se tomaron y por qué.

## Verificación
- [ ] lint
- [ ] test (lista de pruebas nuevas)
- [ ] recorrido: feliz, vacío, error, sin permiso
- [ ] checklist UI
- [ ] auditoría sin CRITICAL/MAJOR
```

## Reglas
- Se escribe al cerrar el módulo, con evidencia real, no con intención.
- No copia el UI kit ni las reglas de negocio: las enlaza.
- Si algo del requerimiento cambió, se corrige `REQUERIMIENTOS.md`, no solo este archivo.
