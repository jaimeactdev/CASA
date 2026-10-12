'use client';

import { Box, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { colors, fontSizes } from '@/styles/designTokens';
import DateFieldMUI from '@/shared/ui/mui/DateFieldMUI';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import SelectFieldMUI from '@/shared/ui/mui/SelectFieldMUI';
import TextAreaFieldMUI from '@/shared/ui/mui/TextAreaFieldMUI';
import AppDialog from '@/shared/ui/Modal/AppDialog';
import type { useFeesViewModel } from '../viewmodel/useFeesViewModel';

type FeesViewModel = ReturnType<typeof useFeesViewModel>;

export default function PayFeesDialog({ vm }: { vm: FeesViewModel }) {
  const theme = useTheme();
  const count = vm.payingFees.length;
  const memberName = vm.payingFees[0]?.memberName ?? '';

  return (
    <AppDialog open={vm.payOpen} onClose={vm.closePay} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={vm.confirmPay} noValidate>
        <DialogTitle>Marcar pagado</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ color: colors.textSecondary }}>
            {count === 1
              ? `Cuota de ${memberName}. El servidor vuelve a calcular el total al guardar.`
              : `${count} cuotas de ${memberName}. Cada una conserva su base y su recargo.`}
          </Typography>
          {vm.preview.lines.map((line) => (
            <Box
              key={line.id}
              sx={{ p: 1.5, borderRadius: '16px', bgcolor: colors.brandTint }}
            >
              <Typography sx={{ fontWeight: 600, color: colors.textPrincipal }}>
                {line.periodLabel}
              </Typography>
              <Typography sx={{ color: colors.textSecondary, fontSize: fontSizes.sm }}>
                Base {line.baseLabel} · Recargo {line.surchargeLabel} · Total {line.totalLabel}
              </Typography>
            </Box>
          ))}
          <Typography sx={{ fontWeight: 600, color: colors.textPrincipal }}>
            Total a registrar: {vm.preview.totalLabel}
          </Typography>
          {vm.paymentMethods.length === 0 ? (
            <Typography sx={{ color: colors.error }}>
              No hay medios de pago activos. Configúralos en parámetros.
            </Typography>
          ) : (
            <SelectFieldMUI
              name="paymentMethod"
              label="Medio de pago"
              value={vm.payValues.paymentMethodId}
              onChange={vm.onChangeMethod}
              options={vm.paymentMethods.map((method) => ({
                value: method.id,
                label: method.name,
              }))}
              error={vm.payErrors.paymentMethodId}
            />
          )}
          <DateFieldMUI
            name="paidOn"
            label="Fecha de pago"
            value={vm.payValues.paidOn}
            onChange={vm.onChangePaidOn}
            maxDate={vm.today}
            error={vm.payErrors.paidOn}
            smallText="Por defecto, hoy. No puede ser futura."
          />
          <TextAreaFieldMUI
            name="paymentNote"
            label="Observación"
            value={vm.payValues.paymentNote}
            onChange={vm.onChangeNote}
            error={vm.payErrors.paymentNote}
            maxlenght={500}
            rows={3}
            smallText="Opcional."
          />
          {vm.payError ? (
            <Typography sx={{ color: colors.error }}>{vm.payError}</Typography>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <HoverIconButton
            text="Cancelar"
            type="button"
            onClick={vm.closePay}
            sx={theme.customButtons.secondary}
          />
          <HoverIconButton
            text="Confirmar pago"
            type="submit"
            disabled={vm.isPaying}
            sx={theme.customButtons.primary}
          />
        </DialogActions>
      </Box>
    </AppDialog>
  );
}
