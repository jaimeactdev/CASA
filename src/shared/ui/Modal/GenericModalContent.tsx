"use client";

import React, { ReactNode } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Typography,
} from "@mui/material";
import AppDialog from "@/shared/ui/Modal/AppDialog";
import CloseIcon from "@mui/icons-material/Close";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  APP_HEADER_HEIGHT_PX,
  APP_MODAL_Z_INDEX,
  MODAL_LARGE_VIEWPORT_PERCENT,
} from "@/shared/layout/appShellConstants";

export type GenericModalFit = "default" | "fullscreen" | "below-header" | "large";

interface GenericModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  text?: string;
  imageSrc?: string;
  closeButtonText?: string;
  showCloseTop?: boolean;
  closeWithX?: boolean;
  fullWidth?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  customWidth?: number;
  titleAlignment?: "left" | "center" | "right";
  verticalPosition?: "top" | "center" | "bottom";
  children?: ReactNode;
  showActions?: boolean;
  /**
   * Tamaño del panel: `large` (~95% viewport, centrado, se percibe como modal),
   * `fullscreen` (viewport completo), `below-header` (debajo del navbar).
   */
  fit?: GenericModalFit;
  /** @deprecated Usar `fit="fullscreen"`. */
  fullScreen?: boolean;
  /** En `fit` expandido, permite `p: 0` para que el hijo controle el layout. */
  contentPadding?: boolean;
}

const GenericModal: React.FC<GenericModalProps> = ({
  open,
  onClose,
  title,
  text,
  imageSrc,
  closeButtonText = "Cerrar",
  showCloseTop = true,
  closeWithX = true,
  fullWidth = true,
  maxWidth = "sm",
  customWidth,
  titleAlignment = "left",
  verticalPosition = "center",
  children,
  showActions = true,
  fit: fitProp,
  fullScreen = false,
  contentPadding = true,
}) => {
  const fit: GenericModalFit =
    fitProp ?? (fullScreen ? "fullscreen" : "default");
  const isExpandedFit =
    fit === "fullscreen" || fit === "below-header" || fit === "large";

  const getVerticalPositionStyles = (): SxProps<Theme> => {
    if (fit === "fullscreen") {
      return {
        "& .MuiDialog-paper": {
          margin: 0,
          maxHeight: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        },
      };
    }

    if (fit === "large") {
      const pct = MODAL_LARGE_VIEWPORT_PERCENT;
      return {
        "& .MuiDialog-paper": {
          margin: "auto",
          width: `${pct}vw`,
          maxWidth: `${pct}vw`,
          height: `${pct}vh`,
          maxHeight: `${pct}vh`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      };
    }

    if (fit === "below-header") {
      const top = APP_HEADER_HEIGHT_PX;
      return {
        "& .MuiDialog-container": {
          alignItems: "flex-start",
        },
        "& .MuiDialog-paper": {
          margin: 0,
          position: "fixed",
          top: `${top}px`,
          left: 0,
          right: 0,
          width: "100%",
          maxWidth: "100%",
          height: `calc(100vh - ${top}px)`,
          maxHeight: `calc(100vh - ${top}px)`,
          display: "flex",
          flexDirection: "column",
          borderRadius: 0,
        },
      };
    }

    const baseStyles = customWidth ? { width: `${customWidth}px`, maxWidth: "none" } : {};

    switch (verticalPosition) {
      case "top":
        return {
          "& .MuiDialog-paper": {
            ...baseStyles,
            margin: "48px auto auto auto",
            alignSelf: "flex-start",
          },
        };
      case "bottom":
        return {
          "& .MuiDialog-paper": {
            ...baseStyles,
            margin: "auto auto 48px auto",
            alignSelf: "flex-end",
          },
        };
      case "center":
      default:
        return {
          "& .MuiDialog-paper": {
            ...baseStyles,
            margin: "auto",
          },
        };
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      fullScreen={fit === "fullscreen"}
      maxWidth={isExpandedFit || customWidth ? false : maxWidth}
      sx={{
        zIndex: APP_MODAL_Z_INDEX,
        ...getVerticalPositionStyles(),
      }}
    >
      {title && (
        <DialogTitle
          sx={{
            m: 0,
            p: isExpandedFit ? 1.5 : 2,
            flexShrink: 0,
            textAlign: titleAlignment,
            ...(isExpandedFit
              ? {
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "primary.main",
                  fontFamily: '"Poppins", Helvetica, Arial, sans-serif',
                }
              : {}),
          }}
        >
          {title}
          {showCloseTop && closeWithX && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent
        dividers={!isExpandedFit}
        sx={
          isExpandedFit
            ? {
                p: contentPadding ? 2 : 0,
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {text && (
          <Typography variant="body1" gutterBottom>
            {text}
          </Typography>
        )}

        {imageSrc && (
          <img
            src={imageSrc}
            alt="Vista de ejemplo del código de cuenta"
            style={{ width: "100%", borderRadius: 8 }}
          />
        )}

        {children}
      </DialogContent>

      {showActions && (!showCloseTop || !closeWithX) && (
        <DialogActions>
          <Button onClick={onClose}>{closeButtonText}</Button>
        </DialogActions>
      )}
    </AppDialog>
  );
};

export default GenericModal;
