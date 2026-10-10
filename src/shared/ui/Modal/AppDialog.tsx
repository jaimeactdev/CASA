"use client";

import Dialog from "@mui/material/Dialog";
import type { DialogProps } from "@mui/material/Dialog";
import { ignoreBackdropClose } from "@/shared/ui/Modal/dialogCloseUtils";

export type AppDialogProps = Omit<DialogProps, "onClose"> & {
  /** Explicit close (X, buttons, Escape). Not called when clicking outside the modal. */
  onClose?: () => void;
};

/**
 * Dialog de MUI con cierre por backdrop deshabilitado de forma global para la app.
 */
export default function AppDialog({ onClose, ...props }: AppDialogProps) {
  return (
    <Dialog
      {...props}
      onClose={onClose ? ignoreBackdropClose(onClose) : undefined}
    />
  );
}
