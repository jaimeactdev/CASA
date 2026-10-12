'use client';

import { Box, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { colors } from '@/styles/designTokens';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import TextAreaFieldMUI from '@/shared/ui/mui/TextAreaFieldMUI';
import AppDialog from '@/shared/ui/Modal/AppDialog';
import type { useFeesViewModel } from '../viewmodel/useFeesViewModel';

type FeesViewModel = ReturnType<typeof useFeesViewModel>;

export default function RevertFeeDialog({ vm }: { vm: FeesViewModel }) {
  const theme = useTheme();
  const fee = vm.revertFee;

  return (
    <AppDialog open={Boolean(fee)} onClose={vm.closeRevert} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={vm.confirmRevert} noValidate>
        <DialogTitle>Corregir pago</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {fee ? (
            <Typography sx={{ color: colors.textSecondary }}>
              Vas a deshacer el pago de {fee.periodLabel} de {fee.memberName}. El valor
              registrado es {fee.totalLabel}. La cuota vuelve a pendiente o morosa según
              la fecha, y el recargo se calcula de nuevo.
            </Typography>
          ) : null}
          <TextAreaFieldMUI
            name="revertNote"
            label="Nota"
            value={vm.revertNote}
            onChange={vm.onChangeRevertNote}
            error={vm.revertError}
            maxlenght={500}
            rows={3}
            smallText="Obligatoria. Queda en la bitácora."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <HoverIconButton
            text="Cancelar"
            type="button"
            onClick={vm.closeRevert}
            sx={theme.customButtons.secondary}
          />
          <HoverIconButton
            text="Corregir pago"
            type="submit"
            disabled={vm.isReverting}
            sx={theme.customButtons.primary}
          />
        </DialogActions>
      </Box>
    </AppDialog>
  );
}
