'use client';

import { Box, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { colors, fontSizes } from '@/styles/designTokens';
import { APP_MODAL_Z_INDEX } from '@/shared/layout/appShellConstants';
import DateFieldMUI from '@/shared/ui/mui/DateFieldMUI';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import TextAreaFieldMUI from '@/shared/ui/mui/TextAreaFieldMUI';
import AppDialog from '@/shared/ui/Modal/AppDialog';
import { StatusIndicator } from '@/shared/ui/StatusIndicatorCell';
import { MINIMUM_NOT_CONFIGURED_MESSAGE } from '../domain/membersTypes';
import type { useMembersViewModel } from '../viewmodel/useMembersViewModel';

type MembersViewModel = ReturnType<typeof useMembersViewModel>;

export default function DeliverBenefitDialog({ vm }: { vm: MembersViewModel }) {
  const theme = useTheme();
  const benefit = vm.deliverTarget;
  const detail = vm.detail;
  const mode = vm.deliverModeValue;
  const canConfirm = mode === 'normal' || mode === 'exception';
  const minDate = vm.fichaYear ? `${vm.fichaYear}-01-01` : undefined;

  return (
    <AppDialog
      open={Boolean(benefit)}
      onClose={vm.closeDeliver}
      maxWidth="sm"
      fullWidth
      sx={{ zIndex: APP_MODAL_Z_INDEX }}
    >
      <Box component="form" onSubmit={vm.confirmDeliver} noValidate>
        <DialogTitle>Registrar entrega</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {benefit && detail ? (
            <Typography sx={{ color: colors.textSecondary }}>
              {benefit.name} para {detail.fullName}. El servidor vuelve a evaluar
              las reglas al guardar.
            </Typography>
          ) : null}
          {benefit?.conditions.map((condition) => (
            <Box
              key={condition.key}
              sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
            >
              <Typography sx={{ color: colors.textBody, fontSize: fontSizes.sm }}>
                {condition.label}
              </Typography>
              <StatusIndicator
                label={condition.passed ? 'Cumple' : 'No cumple'}
                positive={condition.passed}
              />
            </Box>
          ))}
          {benefit?.minimumBlocked ? (
            <Typography sx={{ color: colors.error, fontSize: fontSizes.sm }}>
              {MINIMUM_NOT_CONFIGURED_MESSAGE}
            </Typography>
          ) : null}
          {mode === 'blocked' ? (
            <Typography sx={{ color: colors.textSecondary }}>
              Ese beneficio ya alcanzó el máximo de entregas de este año. Si fue un
              error, anúlala en Beneficios, Entregas.
            </Typography>
          ) : null}
          {mode === 'forbidden' ? (
            <Typography sx={{ color: colors.error }}>
              Tu rol no puede entregar con excepción.
            </Typography>
          ) : null}
          {canConfirm ? (
            <>
              <DateFieldMUI
                name="deliveredOn"
                label="Fecha de entrega"
                value={vm.deliverValues.deliveredOn}
                onChange={vm.onChangeDeliveredOn}
                minDate={minDate}
                maxDate={vm.today}
                error={vm.deliverErrors.deliveredOn}
                smallText="Debe caer en el año de la ficha y no puede ser futura."
              />
              <TextAreaFieldMUI
                name="deliveryNote"
                label="Observación"
                value={vm.deliverValues.note}
                onChange={vm.onChangeDeliveryNote}
                error={vm.deliverErrors.note}
                maxlenght={500}
                rows={3}
                smallText={
                  mode === 'exception'
                    ? 'Obligatoria. Queda en la bitácora.'
                    : 'Opcional.'
                }
              />
            </>
          ) : null}
          {vm.deliverError ? (
            <Typography sx={{ color: colors.error }}>{vm.deliverError}</Typography>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <HoverIconButton
            text="Cancelar"
            type="button"
            onClick={vm.closeDeliver}
            sx={theme.customButtons.secondary}
          />
          {canConfirm ? (
            <HoverIconButton
              text={mode === 'exception' ? 'Registrar con excepción' : 'Registrar entrega'}
              type="submit"
              disabled={vm.isDelivering}
              sx={theme.customButtons.primary}
            />
          ) : null}
        </DialogActions>
      </Box>
    </AppDialog>
  );
}
