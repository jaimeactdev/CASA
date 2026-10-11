'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { DataTable, type DataTableRowClickEvent } from "primereact/datatable";
import { ColumnProps } from "primereact/column";
import { Column } from "primereact/column";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Dialog } from "primereact/dialog";

import { exportTableToExcel } from "@/shared/utils/excelExport";
import { Box } from "@mui/material";
import { colors } from "@/styles/designTokens";
import {
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ConfirmRecordActionModal from "@/shared/ui/Modal/ConfirmRecordActionModal";
import { buildRecordIdentitySummary } from "@/shared/ui/Modal/confirmRecordAction";
import { APP_MODAL_Z_INDEX } from "@/shared/layout/appShellConstants";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  equalsNormalized,
  includesNormalized,
  normalizeForSearch,
} from "@/shared/utils/stringNormalize";
import {
  DataTableColumnFilterHeader,
  DataTableColumnToggleBar,
  DataTableCellText,
  dataTablePanelSx,
} from "./datatableColumnUi";

const isRowActive = (row: any) =>
  String(row?.estado || "")
    .trim()
    .toUpperCase() === "A" ||
  String(row?.estadoDisplay || "")
    .trim()
    .toLowerCase() === "activo";

const isRowInactive = (row: any) =>
  String(row?.estado || "")
    .trim()
    .toUpperCase() === "I" ||
  String(row?.estadoDisplay || "")
    .trim()
    .toLowerCase() === "inactivo";

/** MUI `Menu` no acepta `Fragment`; normaliza a hijos directos o un arreglo. */
const normalizeMenuChildren = (node: React.ReactNode): React.ReactNode => {
  if (node == null || node === false) return null;
  if (Array.isArray(node)) return node;
  if (React.isValidElement(node) && node.type === React.Fragment) {
    return React.Children.toArray(
      (node as React.ReactElement<{ children?: React.ReactNode }>).props
        .children,
    );
  }
  return node;
};

const ROW_CLICK_INTERACTIVE_SELECTOR =
  '.p-row-toggler, .MuiIconButton-root, .MuiMenu-root, .MuiPopover-root, .MuiMenuItem-root, .MuiList-root, [role="menu"], [role="menuitem"], [data-app-no-row-click]';

const ROW_CLICK_SUPPRESS_MS = 400;

/** Evita un `[]` nuevo en cada render cuando no se pasa `collapsibleColumns`. */
const EMPTY_COLLAPSIBLE_COLUMNS: any[] = [];

const columnsDefinitionEquals = (a: any[], b: any[]) =>
  a.length === b.length &&
  a.every(
    (col, i) =>
      col?.field === b[i]?.field &&
      col?.header === b[i]?.header &&
      Boolean(col?.collapsible) === Boolean(b[i]?.collapsible),
  );

/**
 * Menú de acciones por fila (icono ⋯). Incluye las acciones estándar del datatable y,
 * opcionalmente, ítems extra definidos por la pantalla mediante `renderExtraMenuItems`.
 */
const ActionMenu = ({
  rowData,
  onEdit,
  showEdit,
  showInactivate,
  showActivate,
  openConfirm,
  showApprove,
  /** Callback que devuelve nodos hijos del `Menu` de MUI (p. ej. `<MenuItem>...</MenuItem>`). */
  renderExtraMenuItems,
  suppressRowClick,
}: any) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    suppressRowClick?.();
    setAnchorEl(null);
  };
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    suppressRowClick?.();
    setAnchorEl(event.currentTarget);
  };
  const runMenuAction = (event: React.MouseEvent, action: () => void) => {
    event.stopPropagation();
    suppressRowClick?.();
    handleClose();
    window.setTimeout(() => action(), 0);
  };

  // Whether this row should show the inactivate action
  const canInactivate =
    typeof showInactivate === "function"
      ? showInactivate(rowData)
      : showInactivate;
  const canActivate =
    typeof showActivate === "function" ? showActivate(rowData) : showActivate;
  const canApprove =
    (typeof showApprove === "function" ? showApprove(rowData) : showApprove) &&
    isRowActive(rowData);

  const extraMenuItems = normalizeMenuChildren(
    renderExtraMenuItems?.(rowData),
  );
  const hasExtraMenuItems = Array.isArray(extraMenuItems)
    ? extraMenuItems.some((child) => child != null && child !== false)
    : extraMenuItems != null && extraMenuItems !== false;

  /**
   * Sin acciones estándar ni ítems extra: no se muestra el menú para esta fila.
   * Si solo existen ítems personalizados, el menú puede contener únicamente esos.
   */
  if (
    !showEdit &&
    !canInactivate &&
    !canApprove &&
    !canActivate &&
    !hasExtraMenuItems
  )
    return null;

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center" }}
      data-app-no-row-click
    >
      <Tooltip title="Acciones">
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        MenuListProps={{
          onMouseDown: (event: React.MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
          },
        }}
        sx={{ zIndex: APP_MODAL_Z_INDEX + 1 }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {showEdit && (
          <MenuItem
            onClick={(event) => runMenuAction(event, () => onEdit?.(rowData))}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Editar
          </MenuItem>
        )}
        {canInactivate && (
          <MenuItem
            onClick={(event) =>
              runMenuAction(event, () => openConfirm(rowData, "inactivate"))
            }
          >
            <ListItemIcon>
              <ArrowDownwardIcon fontSize="small" />
            </ListItemIcon>
            Inactivar
          </MenuItem>
        )}
        {canActivate && (
          <MenuItem
            onClick={(event) =>
              runMenuAction(event, () => openConfirm(rowData, "activate"))
            }
          >
            <ListItemIcon>
              <ArrowUpwardIcon fontSize="small" />
            </ListItemIcon>
            Activar
          </MenuItem>
        )}
        {canApprove && (
          <MenuItem
            onClick={(event) =>
              runMenuAction(event, () => openConfirm(rowData, "approve"))
            }
          >
            <ListItemIcon>
              <CheckCircleOutlineIcon fontSize="small" />
            </ListItemIcon>
            Aprobar
          </MenuItem>
        )}
        {/* Ítems definidos por la vista (acciones de dominio que no encajan en el set fijo anterior). */}
        {extraMenuItems}
      </Menu>
    </Box>
  );
};

interface CollapsibleColumn {
  header: string;
  previusCharacter?: string;
  format?: string;
  // string (no keyof): en ternarios mobile/desktop TS ensancha literales a string.
  field: string;
}

interface DataTableProps<T> {
  isMobile: boolean;
  data: T[];
  rows: number;
  /** Si se omite, se usan `[rows, rows+30, rows+50, rows+90]` como hasta ahora. */
  rowsPerPageOptions?: number[];
  /**
   * Ancla el desplegable de filas por página del paginador (p. ej. `document.body` dentro de un MUI `Dialog`)
   * para que las opciones no queden recortadas por `overflow` del contenedor.
   */
  paginatorDropdownAppendTo?: "self" | HTMLElement | null | (() => HTMLElement);
  columns: Array<
    ColumnProps & {
      maxLength?: number;
      body?: (rowData: T) => React.ReactNode;
      minWidth?: number;
      width?: number;
      options?: { label: string; value: any }[];
    }
  >;
  collapsibleColumns?: CollapsibleColumn[];
  expandedRows: any[];
  onRowToggle: (e: any) => void;
  showEditButton?: boolean; // Nueva propiedad
  /** Si es false, oculta el icono de exportar a Excel del toolbar. Default true. */
  showExportExcel?: boolean;
  showApproveButton?: boolean | ((rowData: T) => boolean);
  onEditButtonClick?: (rowData: T) => void;
  headerPosition?: "top" | "bottom";
  showColumnToggleMultiSelect?: boolean;
  showInactivateButton?: boolean | ((rowData: T) => boolean);
  onInactivateButtonClick?: (rowData: T) => void;
  showActivateButton?: boolean | ((rowData: T) => boolean);
  onActivateButtonClick?: (rowData: T) => void;
  onApproveButtonClick?: (rowData: T) => void;
  tipoViewAcciones?: "Menu" | "Buttons";

  /**
   * Permite añadir entradas al menú contextual (tipo `Menu`) sin duplicar el datatable por pantalla.
   * Debe devolver elementos válidos como hijos de `Menu` de MUI (normalmente `MenuItem`), para que el
   * `onClick` del menú siga cerrando el popup correctamente.
   *
   * @example
   * renderExtraMenuItems={(row) => (
   *   <MenuItem onClick={() => abrirOtroFlujo(row)}>
   *     <ListItemIcon><TuneIcon fontSize="small" /></ListItemIcon>
   *     Variables técnicas
   *   </MenuItem>
   * )}
   */
  renderExtraMenuItems?: (rowData: T) => React.ReactNode;
  /** Si se define, reemplaza el detalle por columnas colapsables por defecto. */
  rowExpansionTemplate?: (rowData: T) => React.ReactNode;
  /** Clic en la fila (opt-in). No altera tablas que no lo pasen. */
  onRowClick?: (rowData: T) => void;
  /** Native tooltip on the row when `onRowClick` is active. */
  rowClickTooltip?: string;
}

const DataTableLocal = <T extends object>({
  isMobile,
  data,
  rows,
  rowsPerPageOptions: rowsPerPageOptionsProp,
  paginatorDropdownAppendTo,
  columns,
  collapsibleColumns = EMPTY_COLLAPSIBLE_COLUMNS,
  expandedRows,
  onRowToggle,
  showEditButton = false,
  showExportExcel = true,
  showApproveButton = false,
  onEditButtonClick,
  headerPosition = "top",
  showColumnToggleMultiSelect = true,
  showInactivateButton = false,
  onInactivateButtonClick,
  showActivateButton = false,
  onActivateButtonClick,
  onApproveButtonClick,
  tipoViewAcciones = "Buttons",
  renderExtraMenuItems,
  rowExpansionTemplate,
  onRowClick,
  rowClickTooltip,
}: DataTableProps<T>) => {
  const rowClickSuppressUntilRef = useRef(0);

  const suppressRowClick = useCallback(() => {
    rowClickSuppressUntilRef.current = Date.now() + ROW_CLICK_SUPPRESS_MS;
  }, []);

  const handleRowClick = useCallback(
    (event: DataTableRowClickEvent) => {
      if (!onRowClick) return;
      if (Date.now() < rowClickSuppressUntilRef.current) return;
      const target = event.originalEvent.target as HTMLElement | null;
      if (target?.closest(ROW_CLICK_INTERACTIVE_SELECTOR)) {
        return;
      }
      onRowClick(event.data as T);
    },
    [onRowClick],
  );

  const rowClickPassThrough = useMemo(() => {
    if (!onRowClick) return undefined;
    return {
      bodyRow: {
        title: rowClickTooltip,
      },
    };
  }, [onRowClick, rowClickTooltip]);
  const rowsPerPageOptions = useMemo(
    () => rowsPerPageOptionsProp ?? [rows, rows + 30, rows + 50, rows + 90],
    [rows, rowsPerPageOptionsProp],
  );
  /*
    const allColumns = [...columns, ...collapsibleColumns.map(col => ({
        field: col.field,
        header: col.header,
        collapsible: true // flag to tell these columns apart
    }))];*/

  const allColumns = useMemo(
    () => [
      ...columns,
      ...collapsibleColumns.map((col) => ({
        field: col.field,
        header: col.header,
        collapsible: true,
      })),
    ],
    [columns, collapsibleColumns],
  );

  const hasFilterableColumns = useMemo(() => {
    return columns.some((col: any) => col?.filter === true);
  }, [columns]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );
  const [uniqueData, setUniqueData] = useState<Array<T & { uniqueId: string }>>(
    [],
  );
  const [dialogContent, setDialogContent] = useState<string | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [dialogHeader, setDialogHeader] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    [key: string]: { value: string; matchMode: string };
  }>({});
  //const [visibleColumns, setVisibleColumns] = useState(columns.map(col => col.field));
  const [selectedColumns, setSelectedColumns] = useState<any>(allColumns);
  const [searching, setSearching] = useState<{ [key: string]: boolean }>({});
  useEffect(() => {
    /* console.log(" selectedColumns es ", selectedColumns);
          console.log(" columnFilters es ", columnFilters);
            console.log(" searching es ", searching);*/
  }, [selectedColumns, columnFilters, searching]);

  const [sortableState, setSortableState] = useState<{
    [key: string]: boolean;
  }>({});

  /*const handleColumnFilterChange = (value: string, field: string) => {
        setColumnFilters(prev => ({ ...prev, [field]: value }));
    };*/

  useEffect(() => {
    const dataWithUniqueId = data.map((item, index) => {
      const row = item as T & {
        uniqueId?: string | number;
        id?: string | number;
        batchId?: string;
      };
      const stableKey = row.uniqueId ?? row.id ?? row.batchId;
      const uniqueId =
        stableKey != null && String(stableKey).trim() !== ""
          ? String(stableKey)
          : `row-${index}`;
      return { ...item, uniqueId };
    });
    setUniqueData(dataWithUniqueId);
  }, [data]);

  useEffect(() => {
    // Bail out if the definition did not change: avoids "Maximum update depth"
    // cuando `columns` llega como arreglo nuevo en cada render del padre.
    setSelectedColumns((prev: any[]) =>
      columnsDefinitionEquals(prev, allColumns) ? prev : allColumns,
    );
  }, [isMobile, allColumns]);

  const handleColumnToggle = (selectedColumns: any[]) => {
    setSelectedColumns(selectedColumns);
  };

  const isColumnVisible = (field: string) => {
    return selectedColumns.some((col: any) => col.field === field);
  };

  const sumMinWidths = useMemo(() => {
    return selectedColumns
      .filter((c: any) => !c.collapsible)
      .reduce((acc: number, c: any) => {
        const colWidth = Number(c?.minWidth ?? c?.width);
        return (
          acc + (Number.isFinite(colWidth) && colWidth > 0 ? colWidth : 120)
        );
      }, 0);
  }, [selectedColumns]);

  const minTableWidth = useMemo(() => {
    const expander =
      collapsibleColumns.length > 0 || rowExpansionTemplate ? 60 : 0;
    const editCol = showEditButton ? 100 : 0;

    const inactivateCol = showInactivateButton ? 100 : 0;
    const activateCol = showActivateButton ? 100 : 0;
    const paddingAllowance = 48; // algo de espacio adicional
    const menuCol =
      tipoViewAcciones === "Menu" &&
      (showEditButton ||
        showInactivateButton ||
        showApproveButton ||
        showActivateButton ||
        renderExtraMenuItems)
        ? 100
        : 0;
    const total =
      sumMinWidths +
      expander +
      editCol +
      inactivateCol +
      activateCol +
      menuCol +
      paddingAllowance;
    return Math.max(600, total);
  }, [
    sumMinWidths,
    collapsibleColumns.length,
    rowExpansionTemplate,
    showEditButton,
    showInactivateButton,
    showActivateButton,
    showApproveButton,
    tipoViewAcciones,
    renderExtraMenuItems,
  ]);

  const handleShowDialog = (content: string, header: string) => {
    setDialogHeader(header);
    setDialogContent(content);
    setDisplayDialog(true);
  };

  const handleHideDialog = () => {
    setDisplayDialog(false);
  };

  const exportExcel = () => {
    void exportTableToExcel(selectedColumns, filteredData);
  };

  const handleFocus = (field: string) => {
    setSearching((prevState) => ({ ...prevState, [field]: true }));
    setSortableState((prevState) => ({ ...prevState, [field]: false }));
  };

  const handleBlur = (field: string) => {
    setSearching((prevState) => ({ ...prevState, [field]: false }));
    setSortableState((prevState) => ({ ...prevState, [field]: true }));
  };

  const clearFilters = () => {
    setColumnFilters({});

    setFilters({});
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToConfirm, setRowToConfirm] = useState<T | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "inactivate" | "approve" | "activate"
  >("inactivate");

  const openConfirm = (
    row: T,
    action: "inactivate" | "approve" | "activate" = "inactivate",
  ) => {
    if (action === "approve" && !isRowActive(row)) {
      return;
    }
    if (action === "activate" && !isRowInactive(row)) {
      return;
    }
    setRowToConfirm(row);
    setConfirmAction(action);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setRowToConfirm(null);
  };
  const confirmActionSubmit = () => {
    if (!rowToConfirm) {
      closeConfirm();
      return;
    }
    if (confirmAction === "approve") {
      onApproveButtonClick?.(rowToConfirm);
    } else if (confirmAction === "activate") {
      onActivateButtonClick?.(rowToConfirm);
    } else {
      onInactivateButtonClick?.(rowToConfirm);
    }
    closeConfirm();
  };

  const confirmIdentity = useMemo(
    () =>
      buildRecordIdentitySummary(
        rowToConfirm as Record<string, unknown> | null,
        [...columns, ...collapsibleColumns],
      ),
    [rowToConfirm, columns, collapsibleColumns],
  );

  const headerTop = (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}
      >
        {hasFilterableColumns && (
          <Button
            sx={{ textTransform: "none" }}
            variant="outlined"
            startIcon={<SearchOffIcon />}
            onClick={() => {
              clearFilters();
            }}
          >
            Limpiar filtros
          </Button>
        )}

        {showExportExcel ? (
          <Tooltip title="Exportar a Excel">
            <IconButton color="success" onClick={exportExcel}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>
    </Box>
  );

  const headerBottom = (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "center",
        justifyContent: "flex-end",
        mt: 2,
        pt: 1,
        px: 2,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {hasFilterableColumns && (
          <Button
            sx={{ textTransform: "none" }}
            variant="outlined"
            startIcon={<SearchOffIcon />}
            onClick={() => {
              clearFilters();
            }}
          >
            Limpiar filtros
          </Button>
        )}
        {showExportExcel ? (
          <Tooltip title="Exportar a Excel">
            <IconButton color="success" onClick={exportExcel}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>
    </Box>
  );

  const handleFilterChange = (
    field: string,
    value: string,
    matchMode: string,
  ) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: { value, matchMode },
    }));
  };

  /* const applyFilters = (data: T[]) => {
        return data.filter(item =>
            Object.keys(filters).every(field =>
                String(item[field as keyof T]).toLowerCase().includes(filters[field].value.toLowerCase())
            )
        );
    };*/

  const getNestedValue = (path: string, obj: any): any => {
    if (!path || !obj) return null;
    return path
      .split(".")
      .reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : null),
        obj,
      );
  };

  const applyFilters = (data: T[]) => {
    return data.filter((item) =>
      Object.keys(filters).every((field) => {
        const filter = filters[field];
        if (
          !filter ||
          !filter.value ||
          (Array.isArray(filter.value) && filter.value.length === 0)
        )
          return true;

        const value = getNestedValue(field, item);

        if (Array.isArray(filter.value)) {
          // MultiSelect: equality ignoring case and diacritics
          return filter.value.some((val: any) =>
            equalsNormalized(val, value),
          );
        } else {
          // InputText: contains + OR por |, sin distinguir acentos
          const parts = normalizeForSearch(filter.value)
            .split("|")
            .map((p) => p.trim())
            .filter((p) => p !== "");
          if (parts.length === 0) return true;

          return parts.some((part) => includesNormalized(value, part));
        }
      }),
    );
  };

  const filteredData = applyFilters(uniqueData);

  const aplFormat = (type: string, value: any) => {
    if (type.trim() === "formatNumber") {
      return !isNaN(Number(value))
        ? Number(value).toLocaleString("es-ES")
        : value;
    } else return "0";
  };

  // Siempre renderizar la tabla para mostrar el emptyMessage y el header, incluso sin datos

  return (
    <>
      {showColumnToggleMultiSelect && (
        <DataTableColumnToggleBar
          columns={allColumns}
          selectedColumns={selectedColumns}
          onSelectedColumnsChange={handleColumnToggle}
          selectWidth={isMobile ? "20em" : "40em"}
        />
      )}
      <Box sx={dataTablePanelSx}>
        <Box
          sx={{
            width: "100%",
            overflowX: "auto",
            maxWidth: "100%",
            ...(onRowClick
              ? {
                  "& .p-datatable-tbody > tr:not(.p-datatable-emptymessage)": {
                    cursor: "pointer",
                  },
                }
              : {}),
          }}
        >
          <DataTable
            value={filteredData}
            header={headerPosition === "bottom" ? undefined : headerTop}
            footer={headerPosition === "bottom" ? headerBottom : undefined}
            expandedRows={expandedRows}
            onRowToggle={onRowToggle}
            onRowClick={onRowClick ? handleRowClick : undefined}
            pt={rowClickPassThrough}
            rowsPerPageOptions={rowsPerPageOptions}
            paginatorDropdownAppendTo={paginatorDropdownAppendTo}
            rowHover
            stripedRows
            style={{ backgroundColor: "transparent" }}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} a {last} de {totalRecords}"
            tableStyle={{
              tableLayout: "fixed",
              minWidth: `${minTableWidth}px`,
            }}
            rowExpansionTemplate={
              rowExpansionTemplate ??
              ((rowData) => (
                <div className="p-3">
                  {collapsibleColumns
                    .filter((col) => isColumnVisible(col.field as string))
                    .map((col) => (
                      <div key={col.field as string}>
                        <strong>{col.header}: </strong>
                        <DataTableCellText wrap>
                          {typeof rowData[col.field as keyof T] === "string" ||
                          typeof rowData[col.field as keyof T] === "number"
                            ? (col.previusCharacter
                                ? col.previusCharacter
                                : "") +
                              (col.format
                                ? aplFormat(
                                    col.format,
                                    String(rowData[col.field as keyof T]),
                                  )
                                : String(rowData[col.field as keyof T]))
                            : null}
                        </DataTableCellText>
                      </div>
                    ))}
                </div>
              ))
            }
            dataKey="uniqueId"
            paginator={true}
            rows={rows}
            emptyMessage="No se encontraron datos."
          >
            {(collapsibleColumns.length > 0 || rowExpansionTemplate) && (
              <Column expander style={{ width: "3em" }} />
            )}

            {tipoViewAcciones === "Menu" &&
              (showEditButton ||
                showInactivateButton ||
                showApproveButton ||
                showActivateButton ||
                renderExtraMenuItems) && (
                <Column
                  header=""
                  body={(rowData: T) => (
                    <ActionMenu
                      rowData={rowData}
                      onEdit={onEditButtonClick}
                      onApprove={onApproveButtonClick}
                      onInactivate={onInactivateButtonClick}
                      showEdit={showEditButton}
                      showInactivate={showInactivateButton}
                      showActivate={showActivateButton}
                      showApprove={showApproveButton}
                      openConfirm={openConfirm}
                      renderExtraMenuItems={renderExtraMenuItems}
                      suppressRowClick={
                        onRowClick ? suppressRowClick : undefined
                      }
                    />
                  )}
                  style={{ width: "50px", minWidth: "100px" }}
                />
              )}

            {tipoViewAcciones !== "Menu" && showEditButton && (
              <Column
                header=""
                body={(rowData: T) => (
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => onEditButtonClick?.(rowData)}
                        sx={{
                          backgroundColor: colors.brand,
                          color: colors.textPositive,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          "&:hover": {
                            backgroundColor: colors.brandPress,
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                style={{ width: "50px", minWidth: "100px" }}
              />
            )}
            {tipoViewAcciones !== "Menu" && showInactivateButton && (
              <Column
                header=""
                body={(rowData: T) => {
                  const show =
                    typeof showInactivateButton === "function"
                      ? showInactivateButton(rowData)
                      : true;

                  if (!show) return null;

                  return (
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Tooltip title="Inactivar">
                        <IconButton
                          onClick={() => openConfirm(rowData, "inactivate")}
                          sx={{
                            backgroundColor: colors.brand,
                            color: colors.textPositive,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            "&:hover": {
                              backgroundColor: colors.brandPress,
                            },
                          }}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  );
                }}
                style={{ width: "50px", minWidth: "100px" }}
              />
            )}
            {tipoViewAcciones !== "Menu" && showActivateButton && (
              <Column
                header=""
                body={(rowData: T) => {
                  const show =
                    typeof showActivateButton === "function"
                      ? showActivateButton(rowData)
                      : true;

                  if (!show) return null;

                  return (
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Tooltip title="Activar">
                        <IconButton
                          onClick={() => openConfirm(rowData, "activate")}
                          sx={{
                            backgroundColor: colors.brand,
                            color: colors.textPositive,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            "&:hover": {
                              backgroundColor: colors.brandPress,
                            },
                          }}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  );
                }}
                style={{ width: "50px", minWidth: "100px" }}
              />
            )}
            {selectedColumns
              .filter((col: any) => !col.collapsible) // Filtramos las columnas no colapsables
              .map((col: any, index: any) => (
                <Column
                  bodyStyle={{
                    textAlign: col.alignText ? col.alignText : "left",
                  }}
                  key={index}
                  sortable={
                    col.sortable ? sortableState[col.field] !== false : false
                  }
                  sortFunction={col.sortFunction}
                  field={col.field}
                  header={
                    <DataTableColumnFilterHeader
                      label={col.header as string}
                      value={
                        filters[col.field as string]?.value ??
                        (col.options ? [] : "")
                      }
                      onChange={(value) =>
                        handleFilterChange(
                          col.field as string,
                          value as string,
                          "contains",
                        )
                      }
                      options={col.options}
                      filterable={Boolean(col.filter)}
                      filterInputType={col.filterInputType}
                      widthFilterEm={col.withFilter}
                      onFocus={() => handleFocus(col.field as string)}
                      onBlur={() => handleBlur(col.field as string)}
                    />
                  }
                  style={{
                    ...(col.style || {}),
                    minWidth: `${col.minWidth ?? 240}px`,
                    width: col.width ? `${col.width}px` : undefined,
                  }}
                  body={(rowData: T) => {
                    if (typeof col.body === "function") {
                      return col.body(rowData);
                    }
                    //  const cellValue = rowData[col.field as keyof T] ?? '';
                    const fieldPath = col.field as string; // Garantizamos que sea string
                    const cellValue = getNestedValue(fieldPath, rowData) ?? ""; // Extraemos el valor
                    const displayValue = String(cellValue);

                    if (col.maxLength && displayValue.length > col.maxLength) {
                      return (
                        <div>
                          {displayValue.substring(0, col.maxLength) + "... "}
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleShowDialog(
                                displayValue,
                                col.header as string,
                              );
                            }}
                          >
                            Ver más
                          </a>
                        </div>
                      );
                    } else {
                      const displayValue2 =
                        col.format && displayValue
                          ? aplFormat(col.format, displayValue)
                          : displayValue;

                      const finalText = col.previusCharacter
                        ? displayValue2
                          ? col.previusCharacter + displayValue2
                          : displayValue2
                        : "" + displayValue2;
                      return <DataTableCellText>{finalText}</DataTableCellText>;
                    }
                  }}
                />
              ))}
          </DataTable>
        </Box>
      </Box>
      <Dialog
        header={dialogHeader}
        visible={displayDialog}
        style={{ width: "50vw" }}
        dismissableMask={false}
        onHide={handleHideDialog}
      >
        <p>{dialogContent}</p>
      </Dialog>
      <ConfirmRecordActionModal
        open={confirmOpen}
        onClose={closeConfirm}
        onConfirm={confirmActionSubmit}
        action={confirmAction}
        identity={confirmIdentity}
      />
    </>
  );
};

export default DataTableLocal;
