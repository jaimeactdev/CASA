"use client";

import React, { forwardRef, useMemo, useRef, useCallback } from "react";
import {
  TextField,
  FormHelperText,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { resolveBusinessDateBounds, getBusinessDateRangeHintMessage, validateBusinessDateRange } from "@/shared/utils/formatDate";

interface DateFieldProps {
  name: string;
  value: string;
  label?: string;
  smallText?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  readonlyMode?: boolean;
  placeholder?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onEndIconClick?: () => void;
  endIconTooltip?: string;
  minDate?: string;
  maxDate?: string;
  dateFormat?: string;
  /**
   * Si es true (default), limita el rango a 2000-01-01 … 31-dic del año actual + 10.
   * Desactivar para fechas abiertas (p. ej. nacimiento). `minDate`/`maxDate` tienen prioridad.
   */
  restrictYearRange?: boolean;
}

const isoRegex = /^\d{4}-\d{2}-\d{2}$/;

const pad2 = (n: number) => n.toString().padStart(2, "0");

function formatIsoTo(isoDate: string, fmt: string): string {
  if (!isoRegex.test(isoDate)) return isoDate;
  const [yyyy, mm, dd] = isoDate.split("-");
  return fmt.replace(/yyyy/g, yyyy).replace(/MM/g, mm).replace(/dd/g, dd);
}

function parseFormattedToIso(value: string, fmt: string): string {
  if (!value) return "";
  const normalizedFmt = fmt || "dd/MM/yyyy";
  const parts = value.match(/(\d{1,4})/g);
  if (!parts) return value;
  let d = "01",
    m = "01",
    y = "1970";
  if (
    normalizedFmt.includes("dd") &&
    normalizedFmt.includes("MM") &&
    normalizedFmt.includes("yyyy")
  ) {
    const ddIndex = normalizedFmt.indexOf("dd");
    const mmIndex = normalizedFmt.indexOf("MM");
    const yyIndex = normalizedFmt.indexOf("yyyy");
    const ordered = [ddIndex, mmIndex, yyIndex].sort((a, b) => a - b);
    const map: Record<number, string> = {};
    map[ddIndex] = "dd";
    map[mmIndex] = "MM";
    map[yyIndex] = "yyyy";
    const tokenOrder = ordered.map((i) => map[i]);
    const [p1, p2, p3] = parts;
    const assign = (token: string, val: string) => {
      if (token === "dd") d = pad2(parseInt(val, 10));
      if (token === "MM") m = pad2(parseInt(val, 10));
      if (token === "yyyy") y = val.padStart(4, "0");
    };
    assign(tokenOrder[0], p1 || d);
    assign(tokenOrder[1], p2 || m);
    assign(tokenOrder[2], p3 || y);
    return `${y}-${m}-${d}`;
  }
  if (isoRegex.test(value)) return value;
  return value;
}

const DateFieldMUI = forwardRef<HTMLInputElement, DateFieldProps>(
  (
    {
      name,
      value,
      label = "",
      smallText = "",
      onChange,
      onBlur,
      error,
      disabled = false,
      readonlyMode = false,
      placeholder = "",
      startIcon,
      endIcon,
      onEndIconClick,
      endIconTooltip = "",
      minDate,
      maxDate,
      dateFormat = "dd/MM/yyyy",
      restrictYearRange = true,
    },
    ref,
  ) => {
    const theme = useTheme();

    const { min: effectiveMinDate, max: effectiveMaxDate } = useMemo(
      () =>
        resolveBusinessDateBounds({
          minDate,
          maxDate,
          restrictYearRange,
        }),
      [minDate, maxDate, restrictYearRange],
    );

    const rangeHint = useMemo(
      () =>
        getBusinessDateRangeHintMessage({
          minDate,
          maxDate,
          restrictYearRange,
        }),
      [minDate, maxDate, restrictYearRange],
    );

    const internalRef = useRef<HTMLInputElement>(null);

    const handleRef = useCallback(
      (element: HTMLInputElement | null) => {
        internalRef.current = element;
        if (typeof ref === "function") {
          ref(element);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            element;
        }
      },
      [ref],
    );

    const handleIconClick = () => {
      if (onEndIconClick) {
        onEndIconClick();
      } else {
        try {
          if (internalRef.current && "showPicker" in internalRef.current) {
            (internalRef.current as any).showPicker();
          }
        } catch (error) {
          console.warn("showPicker not supported", error);
        }
      }
    };

    /** Valor ISO para `input type="date"`. Si el estado del formulario no es ISO ni dd/MM válido, se usa "" para no disparar la validación nativa del navegador con campos opcionales vacíos o a medias. */
    const isoValue = useMemo(() => {
      if (value == null || String(value).trim() === "") return "";
      if (isoRegex.test(String(value).trim())) return String(value).trim();
      const parsed = parseFormattedToIso(String(value).trim(), dateFormat);
      return isoRegex.test(parsed) ? parsed : "";
    }, [value, dateFormat]);

    const rangeError = useMemo(() => {
      if (!isoValue) return undefined;
      const result = validateBusinessDateRange(isoValue, {
        minDate,
        maxDate,
        restrictYearRange,
      });
      return result === true ? undefined : result;
    }, [isoValue, minDate, maxDate, restrictYearRange]);

    const displayError = error || rangeError;

    const helperText = useMemo(() => {
      if (displayError) return displayError;
      if (smallText && rangeHint) return `${smallText} ${rangeHint}`;
      return smallText || rangeHint || "";
    }, [displayError, smallText, rangeHint]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const iso = e.target.value;
      if (iso === "") {
        const cleared = {
          ...e,
          target: { ...e.target, name, value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(cleared);
        return;
      }
      const formatted = formatIsoTo(iso, dateFormat);
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name,
          value: formatted,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    };

    const adornmentIcon = endIcon ?? <CalendarMonthIcon />;

    return (
      <>
        <Box
          display="flex"
          alignItems="center"
          sx={{
            "&:focus-within .icon-box": {
              borderColor: displayError
                ? theme.palette.error.main
                : theme.palette.primary.main,
              borderWidth: "2px",
            },
            "&:hover .icon-box": {
              borderColor: displayError
                ? theme.palette.error.main
                : theme.palette.primary.main,
              borderWidth: "2px",
            },
          }}
        >
          {startIcon && (
            <Box
              className="icon-box"
              sx={{
                height: "45px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: disabled || readonlyMode ? "#f5f5f5" : "#fff",
                border: displayError ? "2px solid" : "1.5px solid",
                borderColor: displayError ? theme.palette.error.main : "#c4c4c4",
                borderRight: "none",
                borderRadius: "20px 0 0 20px",
                px: 1.5,
                color: theme.palette.grey[500],
              }}
            >
              {startIcon}
            </Box>
          )}

          <TextField
            inputRef={handleRef}
            id={name}
            name={name}
            fullWidth
            label={label}
            variant="outlined"
            type="date"
            value={isoValue}
            placeholder={placeholder}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled}
            InputProps={{
              readOnly: readonlyMode,
              endAdornment: (
                <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
                  <Tooltip title={endIconTooltip || ""}>
                    <IconButton
                      size="small"
                      onClick={handleIconClick}
                      edge="end"
                      tabIndex={-1}
                      sx={{
                        color: displayError
                          ? theme.palette.error.main
                          : theme.palette.primary.main,
                      }}
                    >
                      {adornmentIcon}
                    </IconButton>
                  </Tooltip>
                </Box>
              ),
            }}
            error={!!displayError}
            autoComplete="off"
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: effectiveMinDate,
              max: effectiveMaxDate,
            }}
            sx={{
              ...theme.customStyleForm.uniformFieldHeight,
              /* Oculta el calendario por defecto del input de tipo date para que no se muestre el calendario por defecto del navegador */
              "& input::-webkit-calendar-picker-indicator": {
                opacity: 0,
                display: "none",
                WebkitAppearance: "none",
              },
              ...(isoValue
                ? {}
                : {
                    /* Vacío: ocultar placeholder nativo y su selección azul al enfocar. */
                    "& input": {
                      color: "transparent",
                      caretColor: "transparent",
                    },
                    "& input::-webkit-datetime-edit": {
                      color: "transparent",
                      opacity: 0,
                    },
                    "& input::-webkit-datetime-edit-fields-wrapper": {
                      opacity: 0,
                    },
                    "& input::-webkit-datetime-edit-year-field": {
                      color: "transparent",
                    },
                    "& input::-webkit-datetime-edit-month-field": {
                      color: "transparent",
                    },
                    "& input::-webkit-datetime-edit-day-field": {
                      color: "transparent",
                    },
                    "& input::-webkit-datetime-edit-text": {
                      color: "transparent",
                    },
                    "& input::selection": {
                      backgroundColor: "transparent",
                      color: "transparent",
                    },
                    "& input::-moz-selection": {
                      backgroundColor: "transparent",
                      color: "transparent",
                    },
                  }),
              "& .MuiOutlinedInput-root": {
                ...(theme.customStyleForm.uniformFieldHeight?.[
                  "& .MuiOutlinedInput-root"
                ] ?? {}),
                borderRadius: startIcon ? "0 20px 20px 0" : "20px",
                "&.Mui-disabled": {
                  backgroundColor: "#f5f5f5",
                },
              },
              "& .MuiOutlinedInput-input.Mui-readOnly": {
                backgroundColor: "#f5f5f5",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                ...(theme.customStyleForm.uniformFieldHeight?.[
                  "& .MuiOutlinedInput-notchedOutline"
                ] ?? {}),
                borderLeft: startIcon ? "none" : undefined,
              },
            }}
          />
        </Box>

        {helperText ? (
          <FormHelperText error={!!displayError}>{helperText}</FormHelperText>
        ) : null}
      </>
    );
  },
);

DateFieldMUI.displayName = "DateFieldMUI";

export default DateFieldMUI;
