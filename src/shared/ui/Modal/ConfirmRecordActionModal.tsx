"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Lottie from "lottie-react";
import { useTheme } from "@mui/material/styles";
import AppDialog from "@/shared/ui/Modal/AppDialog";
import HoverIconButton from "@/shared/ui/mui/HoverIconButton";
import {
  confirmRecordActionButtonText,
  confirmRecordActionMessage,
  type ConfirmRecordAction,
  type RecordIdentitySummary,
  type RecordSummaryField,
} from "@/shared/ui/Modal/confirmRecordAction";

const INFO_LOTTIE = "/lottie/InfoStatus.json";

type ConfirmRecordActionModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: ConfirmRecordAction;
  identity?: RecordIdentitySummary | null;
  fields?: RecordSummaryField[];
  message?: string;
  confirmText?: string;
  /** Conservado por compatibilidad; el modal de info no muestra título de cabecera. */
  title?: string;
};

function resolveIdentityLabel(
  identity: RecordIdentitySummary | null | undefined,
  fields: RecordSummaryField[],
): string {
  if (identity?.title) return identity.title;
  if (fields[0]?.value) return fields[0].value;
  return "";
}

function ConfirmMessage({
  message,
  identityLabel,
}: {
  message: string;
  identityLabel: string;
}) {
  const base = message.replace(/\?\s*$/, "").trim();

  if (!identityLabel) {
    return <>{message}</>;
  }

  return (
    <>
      {base}{" "}
      <Box component="strong" sx={{ fontWeight: 700, color: "text.primary" }}>
        {identityLabel}
      </Box>
      ?
    </>
  );
}

export default function ConfirmRecordActionModal({
  open,
  onClose,
  onConfirm,
  action,
  identity,
  fields = [],
  message,
  confirmText,
}: ConfirmRecordActionModalProps) {
  const theme = useTheme();
  const question = message ?? confirmRecordActionMessage(action);
  const buttonText = confirmText ?? confirmRecordActionButtonText(action);
  const identityLabel = resolveIdentityLabel(identity, fields);
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch(INFO_LOTTIE)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: "right", p: 1 }}>
        <IconButton onClick={onClose} aria-label="Cerrar" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", pt: 0, pb: 3 }}>
        <Box sx={{ mb: 1.5, display: "flex", justifyContent: "center" }}>
          {animationData ? (
            <Lottie
              animationData={animationData}
              loop
              autoplay
              style={{ width: 120, height: 120 }}
            />
          ) : (
            <Box sx={{ width: 120, height: 120 }} />
          )}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 1, lineHeight: 1.55 }}
        >
          <ConfirmMessage message={question} identityLabel={identityLabel} />
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mt: 2.5,
          }}
        >
          <Button onClick={onClose} sx={theme.customButtons.secondary}>
            Cancelar
          </Button>
          <HoverIconButton
            text={buttonText}
            iconPosition="right"
            width={150}
            type="button"
            sx={theme.customButtons.primary}
            onClick={onConfirm}
          />
        </Box>
      </DialogContent>
    </AppDialog>
  );
}
