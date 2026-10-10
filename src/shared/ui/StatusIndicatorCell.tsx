"use client";

import { Box } from "@mui/material";
import type { ReactNode } from "react";

export const STATUS_POSITIVE_COLOR = "#00B86B";
export const STATUS_NEGATIVE_COLOR = "#E5003B";

type StatusIndicatorProps = {
  label: string;
  /** true = positivo, false = negativo, null = neutro (N/A, vacío, etc.) */
  positive: boolean | null;
};

export function StatusIndicator({ label, positive }: StatusIndicatorProps) {
  const displayLabel = label || "—";

  if (positive === null) {
    return (
      <Box
        component="span"
        sx={{ typography: "body2", color: "text.secondary" }}
      >
        {displayLabel}
      </Box>
    );
  }

  const color = positive ? STATUS_POSITIVE_COLOR : STATUS_NEGATIVE_COLOR;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        typography: "body1",
        fontWeight: 500,
        color,
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: color,
          flexShrink: 0,
        }}
      />
      {displayLabel}
    </Box>
  );
}

function aprobadoPositive(value: string): boolean | null {
  if (value === "Sí") return true;
  if (value === "No") return false;
  return null;
}

export function aprobadoStatusPositive(value: string): boolean | null {
  return aprobadoPositive(String(value ?? "").trim());
}

function estadoPositive(estado: string): boolean | null {
  const normalized = String(estado ?? "")
    .trim()
    .toLowerCase();
  if (!normalized) return null;
  if (normalized === "exitoso") return true;
  if (normalized === "fallido") return false;
  return null;
}

export function activoInactivoPositive(value: string): boolean | null {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!normalized) return null;
  if (normalized === "activo" || normalized === "a") return true;
  if (normalized === "inactivo" || normalized === "i") return false;
  return null;
}

export function renderEstadoDisplayValue(value: unknown): ReactNode {
  const raw = String(value ?? "").trim();
  if (!raw) return <StatusIndicator label="—" positive={null} />;
  return <StatusIndicator label={raw} positive={activoInactivoPositive(raw)} />;
}

export function renderCollapsibleFieldValue(
  field: string,
  value: unknown,
): ReactNode {
  if (field === "estadoDisplay") return renderEstadoDisplayValue(value);
  if (field === "requiereCondicionesDisplay") {
    const raw = String(value ?? "").trim();
    if (!raw) return <StatusIndicator label="—" positive={null} />;
    return <StatusIndicator label={raw} positive={aprobadoPositive(raw)} />;
  }
  return String(value ?? "");
}

export function aprobadoColumnBody(row: { aprobado?: string }): ReactNode {
  const raw = String(row.aprobado ?? "").trim();
  if (!raw) return <StatusIndicator label="—" positive={null} />;
  return <StatusIndicator label={raw} positive={aprobadoPositive(raw)} />;
}

export function requiereCondicionesDisplayColumnBody(row: {
  requiereCondicionesDisplay?: string;
}): ReactNode {
  const raw = String(row.requiereCondicionesDisplay ?? "").trim();
  if (!raw) return <StatusIndicator label="—" positive={null} />;
  return <StatusIndicator label={raw} positive={aprobadoPositive(raw)} />;
}

export function estadoColumnBody(row: { estado?: string }): ReactNode {
  const raw = String(row.estado ?? "").trim();
  if (!raw) return <StatusIndicator label="—" positive={null} />;
  return <StatusIndicator label={raw} positive={estadoPositive(raw)} />;
}

export function estadoDisplayColumnBody(row: {
  estadoDisplay?: string;
  estado?: string;
}): ReactNode {
  const display = String(row.estadoDisplay ?? "").trim();
  if (display) {
    return (
      <StatusIndicator
        label={display}
        positive={activoInactivoPositive(display)}
      />
    );
  }

  const rawEstado = String(row.estado ?? "").trim();
  if (!rawEstado) return <StatusIndicator label="—" positive={null} />;

  const positive = activoInactivoPositive(rawEstado);
  const label =
    positive === true ? "Activo" : positive === false ? "Inactivo" : rawEstado;
  return <StatusIndicator label={label} positive={positive} />;
}
