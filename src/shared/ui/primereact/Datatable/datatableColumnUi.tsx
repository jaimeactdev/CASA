"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import {
  getBusinessDateMaxIso,
  getBusinessDateMinIso,
} from "@/shared/utils/formatDate";

const FILTER_BORDER = "1px solid #ced4da";

const FILTER_CONTROL_BASE_STYLE: React.CSSProperties = {
  borderRadius: 0,
  border: "none",
  borderBottom: FILTER_BORDER,
  backgroundColor: "transparent",
  boxShadow: "none",
  maxWidth: "100%",
};

const FILTER_CONTROL_CLASS = "datatable-column-filter";
const FILTER_PANEL_CLASS = "datatable-column-filter-panel";
const FILTER_DATE_CONTROL_CLASS = "datatable-column-filter-date";
const FILTER_FONT_SIZE = "15px";

const FILTER_TYPOGRAPHY: React.CSSProperties = {
  fontSize: FILTER_FONT_SIZE,
  lineHeight: 1.35,
};

export const columnFilterInputStyle: React.CSSProperties = {
  ...FILTER_CONTROL_BASE_STYLE,
  ...FILTER_TYPOGRAPHY,
  outline: "none",
  paddingLeft: "12px",
  paddingRight: "8px",
};

export const columnFilterMultiSelectStyle: React.CSSProperties = {
  ...FILTER_CONTROL_BASE_STYLE,
  ...FILTER_TYPOGRAPHY,
};

export const DATA_TABLE_CELL_TEXT_CLASS = "datatable-cell-text";
export const DATA_TABLE_CELL_TEXT_WRAP_CLASS = "datatable-cell-text--wrap";

type DataTableCellTextProps = {
  children: React.ReactNode;
  /** Si true, permite varias líneas sin truncar (columnas descriptivas). */
  wrap?: boolean;
};

/**
 * Contenido de celda con salto forzado en palabras largas, truncado con elipsis
 * y tooltip con el texto completo cuando el contenido desborda.
 */
export function DataTableCellText({
  children,
  wrap = false,
}: DataTableCellTextProps) {
  const text = children == null ? "" : String(children);
  const ref = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || text === "") {
      setIsOverflowing(false);
      return;
    }

    const update = () => {
      setIsOverflowing(
        el.scrollWidth > el.clientWidth + 1 ||
          el.scrollHeight > el.clientHeight + 1,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, wrap]);

  if (text === "") {
    return null;
  }

  const cell = (
    <span
      ref={ref}
      className={
        wrap ? DATA_TABLE_CELL_TEXT_WRAP_CLASS : DATA_TABLE_CELL_TEXT_CLASS
      }
    >
      {text}
    </span>
  );

  if (!isOverflowing) {
    return cell;
  }

  return (
    <Tooltip title={text} placement="top" enterDelay={400}>
      {cell}
    </Tooltip>
  );
}

/** Ancho legible según el placeholder; usa em (más estable que ch). */
function getFilterControlSizing(
  label: string,
  widthFilterEm?: number,
): React.CSSProperties {
  if (widthFilterEm != null) {
    return { width: `${widthFilterEm}em`, maxWidth: "100%" };
  }

  const chars = Math.max(label.trim().length, 4);
  const widthEm = Math.min(20, Math.max(10, Math.ceil(chars * 0.72) + 3));

  return {
    width: `${widthEm}em`,
    maxWidth: "100%",
  };
}

export type ColumnFilterOption = { label: string; value: unknown };

export type DataTableColumnFilterHeaderProps = {
  label: string;
  value: string | unknown[] | undefined;
  onChange: (value: string | unknown[]) => void;
  options?: ColumnFilterOption[];
  /** Si es false, muestra solo la etiqueta (columna sin filtro). */
  filterable?: boolean;
  /** `date` usa calendario día; `month` usa periodo año-mes (`yyyy-MM`). */
  filterInputType?: "text" | "date" | "month";
  tooltip?: string;
  widthFilterEm?: number;
  multiSelectDisplay?: "chip" | "comma";
  maxSelectedLabels?: number;
  selectionLimit?: number;
  panelMaxWidth?: number;
  /** Habilita búsqueda dentro del panel de opciones del MultiSelect. */
  optionFilter?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
};

type ColumnTemporalFilterInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** `date` = día; `month` = periodo año-mes. */
  inputType: "date" | "month";
  tooltip?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

/** Oculta el texto nativo del input date/month y su selección azul al enfocar. */
const hiddenTemporalEditSx = {
  color: "transparent",
  caretColor: "transparent",
  "&::-webkit-datetime-edit": {
    color: "transparent",
    opacity: 0,
  },
  "&::-webkit-datetime-edit-fields-wrapper": {
    opacity: 0,
  },
  "&::-webkit-datetime-edit-year-field": { color: "transparent" },
  "&::-webkit-datetime-edit-month-field": { color: "transparent" },
  "&::-webkit-datetime-edit-day-field": { color: "transparent" },
  "&::-webkit-datetime-edit-text": { color: "transparent" },
  "&::selection": { backgroundColor: "transparent", color: "transparent" },
  "&::-moz-selection": { backgroundColor: "transparent", color: "transparent" },
  "& *::selection": { backgroundColor: "transparent", color: "transparent" },
  "& *::-moz-selection": {
    backgroundColor: "transparent",
    color: "transparent",
  },
} as const;

/** Muestra el periodo como `YYYY-MM` (mismo formato que el listado / valor del input). */
function formatPeriodoYmDisplay(ym: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(ym.trim());
  return match ? `${match[1]}-${match[2]}` : ym;
}

function ColumnTemporalFilterInput({
  label,
  value,
  onChange,
  inputType,
  tooltip,
  onFocus,
  onBlur,
}: ColumnTemporalFilterInputProps) {
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const isMonth = inputType === "month";

  const normalizedValue =
    isMonth
      ? typeof value === "string" && /^\d{4}-\d{2}$/.test(value.trim())
        ? value.trim()
        : ""
      : typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
        ? value.trim()
        : "";

  const minDate = inputType === "date" ? getBusinessDateMinIso() : undefined;
  const maxDate = inputType === "date" ? getBusinessDateMaxIso() : undefined;
  const showPlaceholder = !normalizedValue;
  /** En periodo forzamos visualización `YYYY-MM` (el nativo usa "enero de 2026"). */
  const displayText = isMonth
    ? normalizedValue
      ? formatPeriodoYmDisplay(normalizedValue)
      : label
    : showPlaceholder
      ? label
      : null;
  /** Ancho compacto para `YYYY-MM` o fecha; el icono queda junto al texto. */
  const valueAreaWidth = isMonth ? "6.5em" : "8.75em";
  /** Mes: siempre ocultar nativo. Fecha: solo si está vacío. */
  const hideNativeEdit = isMonth || !normalizedValue;

  const openPicker = () => {
    try {
      inputRef.current?.showPicker?.();
    } catch {
      inputRef.current?.focus();
    }
  };

  return (
    <Box
      className={`${FILTER_CONTROL_CLASS} ${FILTER_DATE_CONTROL_CLASS}`}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        height: "38px",
        borderBottom: FILTER_BORDER,
        backgroundColor: "transparent",
        width: "fit-content",
        maxWidth: "100%",
        gap: 0,
        mr: 1,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: valueAreaWidth,
          maxWidth: "100%",
          minWidth: 0,
          height: "38px",
          flex: "0 0 auto",
        }}
      >
        {displayText != null && (
          <Box
            component="span"
            sx={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: FILTER_FONT_SIZE,
              color: showPlaceholder ? "text.disabled" : "text.primary",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "calc(100% - 4px)",
              zIndex: 1,
            }}
          >
            {displayText}
          </Box>
        )}
        <Box
          component="input"
          type={inputType}
          ref={inputRef}
          value={normalizedValue}
          min={minDate}
          max={maxDate}
          onChange={(event) => {
            const next = event.target.value;
            if (
              inputType === "date" &&
              next &&
              minDate &&
              maxDate &&
              (next < minDate || next > maxDate)
            ) {
              return;
            }
            onChange(next);
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          sx={{
            position: "relative",
            zIndex: 0,
            width: "100%",
            height: "38px",
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            fontSize: FILTER_FONT_SIZE,
            fontFamily: theme.typography.fontFamily,
            paddingLeft: "12px",
            paddingRight: "2px",
            color: "text.primary",
            "&::-webkit-calendar-picker-indicator": {
              opacity: 0,
              display: "none",
              WebkitAppearance: "none",
            },
            ...(hideNativeEdit ? hiddenTemporalEditSx : {}),
          }}
        />
      </Box>
      <Tooltip title={tooltip ?? label} placement="top">
        <IconButton
          size="small"
          tabIndex={-1}
          onClick={openPicker}
          sx={{
            flexShrink: 0,
            width: 28,
            height: 28,
            p: 0.25,
            ml: -0.25,
            color: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: "transparent",
              color: theme.palette.primary.main,
            },
          }}
        >
          <CalendarMonthIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export function DataTableColumnFilterHeader({
  label,
  value,
  onChange,
  options,
  filterable = true,
  filterInputType = "text",
  tooltip,
  widthFilterEm,
  multiSelectDisplay = "comma",
  maxSelectedLabels = 1,
  selectionLimit,
  panelMaxWidth,
  optionFilter = true,
  onFocus,
  onBlur,
}: DataTableColumnFilterHeaderProps) {
  if (!filterable) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          paddingLeft: 7,
        }}
      >
        <span
          style={{
            fontWeight: 600,
            paddingLeft: 5,
            fontSize: 15,
            fontStyle: "italic",
          }}
        >
          {label}
        </span>
      </div>
    );
  }

  const controlSizing = getFilterControlSizing(
    label,
    filterInputType === "date" || filterInputType === "month"
      ? undefined
      : widthFilterEm,
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "4px",
        width: "fit-content",
        maxWidth: "100%",
        minWidth: 0,
      }}
    >
      {options && options.length > 0 ? (
        <MultiSelect
          className={FILTER_CONTROL_CLASS}
          value={Array.isArray(value) ? value : []}
          options={options}
          onChange={(event) => onChange(event.value)}
          placeholder={label}
          display={multiSelectDisplay}
          maxSelectedLabels={maxSelectedLabels}
          selectedItemsLabel="{0} seleccionados"
          selectionLimit={selectionLimit}
          filter={optionFilter}
          filterPlaceholder="Buscar..."
          showSelectAll={false}
          panelClassName={FILTER_PANEL_CLASS}
          style={{ ...columnFilterMultiSelectStyle, ...controlSizing }}
          panelStyle={panelMaxWidth ? { maxWidth: panelMaxWidth } : undefined}
        />
      ) : filterInputType === "date" || filterInputType === "month" ? (
        <ColumnTemporalFilterInput
          label={label}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          inputType={filterInputType}
          tooltip={tooltip}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      ) : (
        <InputText
          className={FILTER_CONTROL_CLASS}
          style={{ ...columnFilterInputStyle, ...controlSizing }}
          placeholder={label}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          tooltip={
            tooltip ??
            "Usa el caracter | como separador para buscar por más de un valor"
          }
          tooltipOptions={{ position: "top" }}
        />
      )}
    </div>
  );
}

export type DataTableColumnToggleBarProps<T = any> = {
  columns: T[];
  selectedColumns: T[];
  onSelectedColumnsChange: (columns: T[]) => void;
  selectWidth?: string;
};

export function DataTableColumnToggleBar<T = any>({
  columns,
  selectedColumns,
  onSelectedColumnsChange,
  selectWidth = "min(40em, 100%)",
}: DataTableColumnToggleBarProps<T>) {
  return (
    <Box sx={dataTableColumnToggleBarSx}>
      <Box
        sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}
      >
        <span style={{ fontWeight: 200 }}>Columnas visibles</span>
        <MultiSelect
          value={selectedColumns}
          options={columns}
          optionLabel="header"
          placeholder="Seleccione columnas"
          onChange={(event) => onSelectedColumnsChange(event.value ?? [])}
          display="chip"
          style={{ width: selectWidth }}
        />
      </Box>
    </Box>
  );
}

export type DataTableLazyToolbarProps = {
  onClearFilters: () => void;
};

export function DataTableLazyToolbar({
  onClearFilters,
}: DataTableLazyToolbarProps) {
  return (
    <Box
      sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}
    >
      <Button
        sx={{ textTransform: "none" }}
        variant="outlined"
        startIcon={<SearchOffIcon />}
        onClick={onClearFilters}
      >
        Limpiar filtros
      </Button>
    </Box>
  );
}

export const dataTableColumnToggleBarSx: SxProps<Theme> = {
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  p: 2,
  mb: 1.5,
};

export const dataTablePanelSx: SxProps<Theme> = {
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  width: "100%",
  maxWidth: "100%",
  display: "grid",
  overflow: "hidden",
  WebkitOverflowScrolling: "touch",
  "& .p-datatable-wrapper": { overflowX: "auto" },
  "& .p-datatable-header": { padding: "6px 12px" },
  "& .p-datatable-footer": { padding: "6px 12px" },
  "& .p-datatable-thead > tr > th": {
    overflow: "hidden",
  },
  "& .p-datatable-table": {
    tableLayout: "fixed",
    width: "100%",
  },
  "& .p-datatable-tbody > tr > td": {
    overflow: "hidden",
    maxWidth: 0,
  },
  [`& .p-datatable-thead > tr > th:has(.${FILTER_DATE_CONTROL_CLASS})`]: {
    overflow: "visible",
  },
  "& .p-datatable-thead > tr > th .p-column-header-content": {
    alignItems: "flex-start",
    width: "fit-content",
    maxWidth: "100%",
  },
  [`& .p-datatable-thead .${FILTER_CONTROL_CLASS}.p-multiselect-chip`]: {
    width: "auto !important",
    maxWidth: "100% !important",
  },
  [`& .p-datatable-thead .${FILTER_CONTROL_CLASS}`]: {
    maxWidth: "100% !important",
    flexShrink: 1,
    fontSize: `${FILTER_FONT_SIZE} !important`,
  },
  [`& .p-datatable-thead .${FILTER_CONTROL_CLASS}.p-inputtext`]: {
    height: "38px !important",
    paddingLeft: "12px !important",
  },
  [`& .p-datatable-thead .${FILTER_CONTROL_CLASS}.p-inputtext::placeholder`]: {
    fontSize: `${FILTER_FONT_SIZE} !important`,
    opacity: 1,
  },
  [`& .p-datatable-thead .${FILTER_CONTROL_CLASS} .p-multiselect-label`]: {
    fontSize: `${FILTER_FONT_SIZE} !important`,
    height: "38px !important",
    paddingTop: "8px !important",
    paddingLeft: "12px !important",
  },
  [`& .p-datatable-thead .${FILTER_CONTROL_CLASS} .p-multiselect-label.p-placeholder`]:
    {
      fontSize: `${FILTER_FONT_SIZE} !important`,
    },
  "& .p-datatable-thead .p-multiselect, & .p-datatable-thead .p-inputtext": {
    borderRadius: 0,
  },
  [`& .p-datatable-thead .${FILTER_DATE_CONTROL_CLASS}`]: {
    fontSize: `${FILTER_FONT_SIZE} !important`,
  },
};
