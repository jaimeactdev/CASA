# Catálogo de componentes compartidos

Todo control reutilizable vive en `src/shared`. Antes de crear uno nuevo,
buscar aquí. Si el caso es de un solo feature, el componente vive en
`src/features/<nombre>/view/`, no en `shared`.

Guía visual: `docs/ui-kit.md`.

---

## Botones

| Componente | Ruta | Uso |
|------------|------|-----|
| Estilos canónicos | `src/styles/components/buttonStyles.ts` → `theme.customButtons` | primary / secondary / ghost / sm / lg |
| `HoverIconButton` | `src/shared/ui/mui/HoverIconButton.tsx` | CTA con icono (píldora 44px). Preferido para primarios. |
| `RippleHoverButton` | `src/shared/ui/mui/RippleHoverButton .tsx` | Primario con ripple de hover. |

No usar `p-button` de PrimeReact ni `Button` MUI sin `sx={theme.customButtons.*}`.

---

## Campos MUI (kit de formularios)

Todos aplican altura 45px y radio 20px. Importar desde `@/shared/ui/mui/...`.

| Componente | Cuándo |
|------------|--------|
| `InputFieldMUI` | Texto, números, keyfilters, miles, iconos laterales. Guía: `guia-InputFieldMUI.html` |
| `PasswordFieldMUI` | Contraseña |
| `TextAreaFieldMUI` | Texto multilínea |
| `DateFieldMUI` | Fecha |
| `SelectFieldMUI` | Select simple |
| `SelectWithSearchFieldMUI` | Select con búsqueda |
| `MultiSelectFieldMUI` | Multi-select |
| `MultiSelectWithSearchFieldMUI` | Multi-select con búsqueda |
| `SearchableListFieldMUI` | Lista buscable |
| `CheckboxFieldMUI` / `CheckboxGroupFieldMUI` | Check |
| `RadioButtonFieldMUI` | Radio |
| `CustomStepConnector` | Conector visual de wizard |

Layout del form: `theme.customStyleForm` (`fullContainer2`, `grid3md`, `grid6md`,
`grid12md`, `uniformFieldHeight`, títulos).

---

## Campos legacy (`src/shared/components`)

Existen wrappers anteriores (`InputNumber`, `CalendarField`, `TextAreaField`,
`CheckboxField`, `MultiSelectField`, `SelectButtonField`, `RadioFieldMUI`).
**Código nuevo DEBE usar `shared/ui/mui`**, no esta carpeta, salvo sesión.

| Componente | Uso vigente |
|------------|-------------|
| `SessionTimeoutModal` / `SessionToast` | Timeout de inactividad |
| `Breadcrumb` | Migas (datos desde `useBreadcrumbs`) |
| `RouteModalProvider` | Modales disparados por ruta |

---

## Tablas

| Componente | Ruta | Uso |
|------------|------|-----|
| `DatatableLocal` | `ui/primereact/Datatable/DatatableLocal.tsx` | Datos ya en cliente: filtro, sort, export, menú de fila |
| `DatatableApi` | `ui/primereact/Datatable/DatatableApi.tsx` | Paginación/filtro en servidor |
| `DatatableApiPaginator` | mismo folder | Paginador del modo API |
| `DataTableMUI` | `ui/table/DataTableMUI.tsx` | Tabla MUI (casos simples; preferir Prime si hay export/menú) |
| `StatusIndicatorCell` | `ui/StatusIndicatorCell.tsx` | Punto de estado (círculo) |

Helpers: `datatableColumnUi.tsx`, `emptyCollapsibleColumns.ts`.

**No usar** en features nuevas: `GenericTablePagination.tsx` (pieza interna).

---

## Modales y diálogo

| Componente | Uso |
|------------|-----|
| `AppDialog` | Único `Dialog` de la app (sin cierre por backdrop) |
| `ConfirmRecordActionModal` + `confirmRecordAction.ts` | Activar / inactivar / eliminar registro |
| `CustomMessageModal` | Mensaje global (ya está en root layout) |
| `GenericModalContent` | Cuerpo genérico; preferir `AppDialog` + contenido explícito |

Cierre: `dialogCloseUtils.ts`. z-index: `src/shared/layout/appShellConstants.ts`.

---

## Layout / navegación

| Componente | Uso |
|------------|-----|
| `Header` | Barra superior (íconos desde `src/config/appIcons.ts`) |
| `SidebarMenu` / `ResponsiveSidebarMenu` | Menú lateral |
| `BrandLogo` (`shared/ui/brand`) | Logo del producto (`full` / `mark` / `login`). Usa `appConfig.assets`; sin archivo, genera un monograma |
| `menuItems.ts` | Árbol de menú (status `A` / `I` / `R`) |
| `breadcrumbs.ts` + `useBreadcrumbs` | Migas |
| `LoaderGlobal` | Overlay de carga |
| `MultiStepWizard` + `AnimatedStepIcon` | Flujos por pasos |

---

## Iconos y feedback

| Componente | Uso |
|------------|-----|
| `SessionToast` | Toast de sesión |

Toasts de sesión: `useSessionStore`. No montar otro motor de toast por feature.

---

## Hooks compartidos

| Hook | Uso |
|------|-----|
| `useBreakpoint` | `isXs` / `isSm` para shell |
| `useBreadcrumbs` | Migas de la ruta actual |
| `useDropdownOptions` | Opciones de select (el origen lo resuelve el feature vía `data/`) |
| `useRouteModal` | ¿Hay modal de ruta activo? |

---

## Utils

| Util | Uso |
|------|-----|
| `apiErrorUtils` | Extraer mensaje de error de una respuesta remota |
| `excelExport` | Descarga `.xlsx` (exceljs, cargado al exportar). Lo usan todas las tablas; para otro listado, `exportTableToExcel(columnas, filas)` |
| `formatDate` | Fechas |
| `stringNormalize` | Búsqueda/filtro en tablas (sin tildes) |

I/O remota **no** vive aquí: los repositorios del feature (`data/`) usan
`core/network/httpRequestProvider.ts` u otro adaptador.

---

## Cómo agregar un componente compartido

1. Confirmar que no existe equivalente.
2. Debe usarse (o usarse de inmediato) en **más de un feature**.
3. Cumplir `docs/ui-kit.md` (radio, color, botones).
4. Colocarlo en `shared/ui/mui` (form/botón), `shared/ui/Modal`,
   `shared/ui/primereact` o `shared/layouts` según familia.
5. Documentarlo en esta tabla en el cierre de la feature.
