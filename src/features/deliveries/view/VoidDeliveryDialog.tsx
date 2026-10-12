'use client';

import { Box, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { colors } from '@/styles/designTokens';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import TextAreaFieldMUI from '@/shared/ui/mui/TextAreaFieldMUI';
import AppDialog from '@/shared/ui/Modal/AppDialog';
import type { useDeliveriesViewModel } from '../viewmodel/useDeliveriesViewModel';

type DeliveriesViewModel = ReturnType<typeof useDeliveriesViewModel>;

export default function VoidDeliveryDialog({ vm }: { vm: DeliveriesViewModel }) {
  const theme = useTheme();
  const delivery = vm.voidTarget;

  return (
    <AppDialog open={Boolean(delivery)} onClose={vm.closeVoid} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={vm.confirmVoid} noValidate>
        <DialogTitle>Anular entrega</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {delivery ? (
            <Typography sx={{ color: colors.textSecondary }}>
              Vas a anular {delivery.benefitName} de {delivery.memberName} (
              {delivery.deliveredOnLabel}). Deja de contar para el cupo de {delivery.year}.
              La entregó {delivery.deliveredByName}.
            </Typography>
          ) : null}
          <TextAreaFieldMUI
            name="voidNote"
            label="Nota"
            value={vm.voidNote}
            onChange={vm.onChangeVoidNote}
            error={vm.voidError}
            maxlenght={500}
            rows={3}
            smallText="Obligatoria. Queda en la bitácora."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <HoverIconButton
            text="Cancelar"
            type="button"
            onClick={vm.closeVoid}
            sx={theme.customButtons.secondary}
          />
          <HoverIconButton
            text="Anular entrega"
            type="submit"
            disabled={vm.isVoiding}
            sx={theme.customButtons.primary}
          />
        </DialogActions>
      </Box>
    </AppDialog>
  );
}
