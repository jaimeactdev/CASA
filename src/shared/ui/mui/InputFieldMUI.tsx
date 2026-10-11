"use client";

import React, { forwardRef } from "react";
import {
  TextField,
  FormHelperText,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

type KeyFilterType =
  | "int"
  | "pint"
  | "num"
  | "money"
  | "hex"
  | "alpha"
  | "alphanum"
  | "email"
  | "pnum"
  | "alpha-es"
  | "alphanum-es"
  | "alphanum-es-dot"
  | "alphanum-es-dot-dash"
  | RegExp;

interface InputFieldProps {
  name: string;
  value: string | number;
  smallText?: string;
  label?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  readonlyMode?: boolean;
  placeholder?: string;
  floatlabel?: boolean;
  floatText?: string;
  maxlenght?: number;
  keyfilter?: KeyFilterType;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode; //iconos de ayuda
  onEndIconClick?: () => void; // callback opcional para abrir modal
  endIconTooltip?: string;
  formatThousands?: boolean; // nueva prop para formatear miles
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const regexMap: Record<Exclude<KeyFilterType, RegExp>, RegExp> = {
  int: /^-?\d*$/,
  pint: /^\d*$/,
  // Requiere al menos un dígito antes del decimal (rechaza .333 / ,333).
  num: /^-?\d+(\.\d*)?$/,
  money: /^\d+(\.\d{0,2})?$/,
  hex: /^[0-9a-fA-F]*$/,
  alpha: /^[A-Za-z]*$/,
  alphanum: /^[A-Za-z0-9]*$/,
  email: /^[a-zA-Z0-9@._-]*$/,
  pnum: /^\+?\d*$/,
  "alpha-es": /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/ /* letras, espacio, acentos, ñ */,
  "alphanum-es":
    /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]*$/ /* letras, números, espacio, acentos, ñ */,
  "alphanum-es-dot": /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.]*$/,
  /* letras, números, espacio, acentos, ñ, puntos, comas y guiones */
  "alphanum-es-dot-dash": /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-]*$/,
};

const NUMERIC_KEYFILTERS = new Set<KeyFilterType>([
  "int",
  "pint",
  "num",
  "money",
  "pnum",
]);
const DEFAULT_MAX_LENGTH = 2000;
const DEFAULT_NUMERIC_MAX_LENGTH = 20;

/** Separador decimal (, o .) sin dígito a la izquierda: ,333 / .333 / -.5 */
const hasLeadingDecimalSeparator = (value: string) => /^-?[.,]/.test(value);

/**
 * Limpia texto pegado desde fuentes externas (Excel, PDF, etc.) aplicando las
 * mismas reglas numéricas: sin "e"/"E", sin decimal al inicio, un solo separador.
 */
const sanitizePastedNumeric = (
  raw: string,
  keyfilter: KeyFilterType,
  maxLength: number,
): string | null => {
  if (typeof keyfilter !== "string" || !NUMERIC_KEYFILTERS.has(keyfilter)) {
    return null;
  }

  const text = raw.replace(/[\u00A0\s]/g, "");
  if (!text) return null;
  // Misma regla que al escribir: rechazar notación científica / letra "e".
  if (/[eE]/.test(text)) return null;

  const allowsNegative = keyfilter === "int" || keyfilter === "num";
  let body = text;
  let sign = "";

  if (body.startsWith("-")) {
    if (!allowsNegative) return null;
    sign = "-";
    body = body.slice(1);
  } else if (body.startsWith("+")) {
    if (keyfilter === "pnum") sign = "+";
    body = body.slice(1);
  }

  // Separador decimal de primero → inválido (,333 / .333).
  if (/^[.,]/.test(body)) return null;

  if (keyfilter === "int" || keyfilter === "pint" || keyfilter === "pnum") {
    const digits = body.replace(/\D/g, "");
    if (!digits) return null;
    return `${sign}${digits}`.slice(0, maxLength);
  }

  // num / money: el último , o . es el decimal; el resto de separadores se ignoran.
  const lastComma = body.lastIndexOf(",");
  const lastDot = body.lastIndexOf(".");
  const hasDecimal = lastComma >= 0 || lastDot >= 0;
  const sepIndex = hasDecimal ? Math.max(lastComma, lastDot) : -1;

  const integerRaw = hasDecimal ? body.slice(0, sepIndex) : body;
  const decimalRaw = hasDecimal ? body.slice(sepIndex + 1) : "";
  const integerPart = integerRaw.replace(/[^\d]/g, "");
  let decimalPart = decimalRaw.replace(/[^\d]/g, "");

  if (!integerPart) return null;

  if (keyfilter === "money") {
    decimalPart = decimalPart.slice(0, 2);
  }

  const next = hasDecimal
    ? `${sign}${integerPart}.${decimalPart}`
    : `${sign}${integerPart}`;

  return next.slice(0, maxLength);
};

const InputFieldMUI = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      name,
      value,
      smallText = "",
      label = "",
      onChange,
      onBlur,
      error,
      disabled = false,
      readonlyMode = false,
      maxlenght,
      keyfilter,
      startIcon,
      placeholder = "",
      endIcon,
      onEndIconClick,
      endIconTooltip = "",
      formatThousands = false,
      onKeyDown,
    },
    ref,
  ) => {
    const theme = useTheme();

    const isNumericKeyfilter =
      typeof keyfilter === "string" && NUMERIC_KEYFILTERS.has(keyfilter);

    // Si el campo ya define maxlenght (p. ej. 6), se respeta; si no, numéricos → 20.
    const effectiveMaxLength =
      maxlenght ??
      (isNumericKeyfilter ? DEFAULT_NUMERIC_MAX_LENGTH : DEFAULT_MAX_LENGTH);

    const validateInput = (inputValue: string) => {
      if (!keyfilter) return true;
      if (inputValue === "") return true; // Permitir borrar todo
      // Permitir '-' mientras se escribe un negativo en filtros que lo admiten.
      if (
        inputValue === "-" &&
        typeof keyfilter === "string" &&
        (keyfilter === "int" || keyfilter === "num")
      ) {
        return true;
      }
      if (hasLeadingDecimalSeparator(inputValue)) return false;

      const valueToTest =
        typeof keyfilter === "string" &&
        (keyfilter === "num" || keyfilter === "money")
          ? inputValue.replace(",", ".")
          : inputValue;

      // Tras normalizar coma → punto, volver a rechazar decimal inicial (.333).
      if (hasLeadingDecimalSeparator(valueToTest)) return false;

      const pattern =
        typeof keyfilter === "string" ? regexMap[keyfilter] : keyfilter;
      return pattern.test(valueToTest);
    };

    const formatNumber = (num: string | number) => {
      if (!formatThousands) return num;
      // Remover caracteres no numéricos excepto punto decimal
      const cleanNum = String(num).replace(/[^\d.]/g, "");
      // Separar parte entera y decimal
      const parts = cleanNum.split(".");
      // Formatear parte entera con separadores de miles
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    };

    const unformatNumber = (formattedNum: string) => {
      if (!formatThousands) return formattedNum;
      // Remover comas para obtener el valor numérico
      return formattedNum.replace(/,/g, "");
    };

    const exceedsMaxLength = (rawValue: string) =>
      rawValue.length > effectiveMaxLength;

    const emitChange = (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ClipboardEvent<HTMLInputElement>,
      nextValue: string,
    ) => {
      const syntheticEvent = {
        ...e,
        target: {
          ...(e.target as HTMLInputElement),
          value: nextValue,
          name,
        },
      };
      onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isNumericKeyfilter && (e.key === "e" || e.key === "E")) {
        e.preventDefault();
        return;
      }
      onKeyDown?.(e);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (!isNumericKeyfilter || !keyfilter || disabled || readonlyMode) return;

      const clipboard = e.clipboardData.getData("text");
      if (!clipboard) return;

      e.preventDefault();

      const input = e.currentTarget;
      const current = String(value ?? "");
      const start = input.selectionStart ?? current.length;
      const end = input.selectionEnd ?? current.length;
      const merged = `${current.slice(0, start)}${clipboard}${current.slice(end)}`;

      const sanitized = sanitizePastedNumeric(
        merged,
        keyfilter,
        effectiveMaxLength,
      );
      if (sanitized == null) return;
      if (!validateInput(sanitized)) return;
      if (exceedsMaxLength(sanitized)) return;

      emitChange(e, sanitized);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (isNumericKeyfilter && /[eE]/.test(inputValue)) return;
      // Rechaza ,333 / .333 aunque formatThousands quite la coma después.
      if (isNumericKeyfilter && /^-?[.,]\d/.test(inputValue)) return;

      if (formatThousands) {
        // Remover formato para validación
        const unformattedValue = unformatNumber(inputValue);
        if (exceedsMaxLength(unformattedValue)) return;
        if (validateInput(unformattedValue)) {
          emitChange(e, unformattedValue);
        }
      } else {
        if (exceedsMaxLength(inputValue)) return;
        if (validateInput(inputValue)) {
          onChange(e);
        }
      }
    };

    // Formatear el valor mostrado si formatThousands está habilitado
    const displayValue = formatThousands ? formatNumber(value) : value;
    const valueTooltip = String(displayValue ?? "").trim();

    const maxLengthHint = isNumericKeyfilter
      ? `Máximo ${effectiveMaxLength} caracteres`
      : "";

    const helperText = [smallText, maxLengthHint].filter(Boolean).join(" · ");

    return (
      <>
        <Tooltip
          title={valueTooltip}
          disableHoverListener={!valueTooltip}
          enterDelay={400}
        >
          <Box
            display="flex"
            alignItems="center"
            sx={{
              width: "100%",
              "&:focus-within .icon-box": {
                borderColor: error
                  ? theme.palette.error.main
                  : theme.palette.primary.main,
                borderWidth: "2px",
              },
              "&:hover .icon-box": {
                borderColor: error
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
                  backgroundColor:
                    disabled || readonlyMode ? "#f5f5f5" : "#fff",
                  border: error ? "2px solid" : "1.5px solid",
                  borderColor: error ? theme.palette.error.main : "#c4c4c4",
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
              inputRef={ref}
              id={name}
              name={name}
              fullWidth
              label={label}
              variant="outlined"
              value={displayValue ?? ""}
              placeholder={placeholder}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={onBlur}
              disabled={disabled}
              InputProps={{
                readOnly: readonlyMode,
                endAdornment: endIcon ? (
                  <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
                    <Tooltip title={endIconTooltip || ""}>
                      <IconButton
                        size="small"
                        onClick={onEndIconClick}
                        edge="end"
                        tabIndex={-1} // evita que robe el foco del input
                        sx={{
                          color: error
                            ? theme.palette.error.main
                            : theme.palette.primary.main,
                        }}
                      >
                        {endIcon}
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : undefined,
              }}
              error={!!error}
              autoComplete="off"
              // Con formatThousands el límite se aplica al valor sin comas (handleChange).
              inputProps={
                formatThousands ? undefined : { maxLength: effectiveMaxLength }
              }
              sx={{
                ...theme.customStyleForm.uniformFieldHeight,
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
        </Tooltip>

        {error ? (
          <FormHelperText error>{error}</FormHelperText>
        ) : (
          helperText && <FormHelperText>{helperText}</FormHelperText>
        )}
      </>
    );
  },
);

InputFieldMUI.displayName = "InputFieldMUI";

export default InputFieldMUI;
