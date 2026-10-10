"use client";

import { Box, Typography } from "@mui/material";
import { appConfig } from "@/config/appConfig";
import { colors, fontSizes, fontWeights } from "@/styles/designTokens";
import { resolveAssetUrl, toMonogram } from "./monogram";

export interface BrandLogoProps {
  /** `full` = mark + name, `mark` = compact square, `login` = login screen asset */
  variant?: "full" | "mark" | "login";
  /** Rendered height in px; width follows the image ratio */
  height?: number;
}

/**
 * Product logo from appConfig.assets. Without a configured file it renders
 * a monogram in the primary color, so a new project never shows another brand.
 */
export function BrandLogo({ variant = "full", height = 40 }: BrandLogoProps) {
  const src =
    variant === "mark"
      ? appConfig.assets.logoMark
      : variant === "login"
        ? appConfig.assets.logoLogin
        : appConfig.assets.logoFull;

  if (src) {
    return (
      <Box
        component="img"
        src={resolveAssetUrl(src)}
        alt={appConfig.logoAlt}
        sx={{ height, width: "auto", maxWidth: "100%", objectFit: "contain", display: "block" }}
      />
    );
  }

  const mark = (
    <Box
      aria-hidden={variant !== "mark"}
      role={variant === "mark" ? "img" : undefined}
      aria-label={variant === "mark" ? appConfig.logoAlt : undefined}
      sx={{
        width: height,
        height,
        flexShrink: 0,
        borderRadius: "12px",
        bgcolor: colors.brand,
        color: colors.textPositive,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: fontWeights.bold,
        fontSize: Math.round(height * 0.4),
        letterSpacing: "0.02em",
        userSelect: "none",
      }}
    >
      {toMonogram(appConfig.name, appConfig.monogram)}
    </Box>
  );

  if (variant === "mark") return mark;

  return (
    <Box
      role="img"
      aria-label={appConfig.logoAlt}
      sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}
    >
      {mark}
      <Typography
        component="span"
        noWrap
        sx={{
          fontSize: variant === "login" ? fontSizes.h3 : fontSizes.lg,
          fontWeight: fontWeights.semibold,
          color: colors.textBody,
          lineHeight: 1.2,
        }}
      >
        {appConfig.name}
      </Typography>
    </Box>
  );
}
