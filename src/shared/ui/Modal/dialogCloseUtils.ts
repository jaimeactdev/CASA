import type { DialogProps } from "@mui/material/Dialog";

type DialogCloseReason = "backdropClick" | "escapeKeyDown";

/**
 * Envuelve el cierre de un MUI Dialog para ignorar clics en el backdrop.
 */
export function ignoreBackdropClose(onClose: () => void): DialogProps["onClose"] {
  return (_event, reason?: DialogCloseReason) => {
    if (reason === "backdropClick") return;
    onClose();
  };
}
