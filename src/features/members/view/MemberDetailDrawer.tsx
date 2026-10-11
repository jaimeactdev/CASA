'use client';

import type { ReactNode } from 'react';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { colors, fontSizes } from '@/styles/designTokens';
import { APP_MODAL_Z_INDEX } from '@/shared/layout/appShellConstants';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import { StatusIndicator } from '@/shared/ui/StatusIndicatorCell';
import type { useMembersViewModel } from '../viewmodel/useMembersViewModel';
import type { MemberBenefitRecord, MemberFeeRecord } from '../domain/membersTypes';

type MembersViewModel = ReturnType<typeof useMembersViewModel>;

function statusPositive(label: string): boolean | null {
  if (label === 'Activo' || label === 'Pagado' || label === 'No') return true;
  if (label === 'Retirado' || label === 'Moroso' || label === 'Sí') return false;
  return null;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          fontWeight: 600,
          color: colors.textPrincipal,
          fontSize: fontSizes.md,
          mb: 1,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 1.25 }}>
      <Typography sx={{ color: colors.textSecondary, fontSize: fontSizes.xs }}>
        {label}
      </Typography>
      <Typography sx={{ color: colors.textBody, fontSize: fontSizes.md }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

function FeeRow({ fee }: { fee: MemberFeeRecord }) {
  return (
    <Box
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: '16px',
        border: `1px solid ${colors.surface2}`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
        <Typography sx={{ fontWeight: 600, color: colors.textPrincipal }}>
          {fee.periodLabel}
          {fee.isReduced ? ' · reducida' : ''}
        </Typography>
        <StatusIndicator
          label={fee.statusLabel}
          positive={statusPositive(fee.statusLabel)}
        />
      </Box>
      <Typography sx={{ color: colors.textSecondary, fontSize: fontSizes.sm }}>
        Base {fee.baseAmountLabel} · Recargo {fee.surchargeLabel} · Total {fee.totalLabel}
      </Typography>
    </Box>
  );
}

function BenefitRow({ benefit }: { benefit: MemberBenefitRecord }) {
  return (
    <Box
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: '16px',
        border: `1px solid ${colors.surface2}`,
      }}
    >
      <Typography sx={{ fontWeight: 600, color: colors.textPrincipal, mb: 0.5 }}>
        {benefit.name}
      </Typography>
      <Typography sx={{ color: colors.textSecondary, fontSize: fontSizes.sm }}>
        {benefit.meetsMinimum
          ? `Cumple el mínimo de ${benefit.minPaidFeesInYear} cuotas.`
          : `No cumple el mínimo de ${benefit.minPaidFeesInYear} cuotas.`}
      </Typography>
      <Typography sx={{ color: colors.textSecondary, fontSize: fontSizes.sm }}>
        {benefit.alreadyReceived
          ? `Ya lo recibió este año (${benefit.deliveriesThisYear}).`
          : 'Aún no lo ha recibido este año.'}
      </Typography>
      {benefit.minimumBlocked ? (
        <Typography sx={{ color: colors.error, fontSize: fontSizes.sm }}>
          Falta definir cuántas cuotas exige este beneficio.
        </Typography>
      ) : null}
    </Box>
  );
}

export default function MemberDetailDrawer({ vm }: { vm: MembersViewModel }) {
  const theme = useTheme();
  const detail = vm.detail;

  return (
    <Drawer
      anchor="right"
      open={vm.drawerOpen}
      onClose={vm.closeDetail}
      sx={{ zIndex: APP_MODAL_Z_INDEX - 50 }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480, md: 560 },
          borderTopLeftRadius: '16px',
          borderBottomLeftRadius: '16px',
          p: 3,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: fontSizes.xl, color: colors.textPrincipal }}>
          Ficha del afiliado
        </Typography>
        <IconButton
          onClick={vm.closeDetail}
          aria-label="Cerrar ficha"
          size="small"
          sx={{ borderRadius: '50%' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {vm.isLoadingDetail ? (
        <Typography sx={{ color: colors.textSecondary }}>Cargando ficha…</Typography>
      ) : null}
      {vm.detailError ? (
        <Typography sx={{ color: colors.error }}>{vm.detailError}</Typography>
      ) : null}

      {detail ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 600, color: colors.textPrincipal }}>
                {detail.memberNumberLabel} · {detail.fullName}
              </Typography>
              <Typography sx={{ color: colors.textSecondary }}>
                {detail.documentLabel}
              </Typography>
            </Box>
            <StatusIndicator
              label={detail.statusLabel}
              positive={statusPositive(detail.statusLabel)}
            />
          </Box>

          <Section title="Datos personales">
            <Field label="Sexo" value={detail.sexLabel} />
            <Field label="Nacimiento" value={detail.birthDateLabel} />
            <Field label="Camisa" value={detail.shirtSize} />
            <Field label="Pantalón" value={detail.pantsSize} />
            <Field label="Calzado" value={detail.shoeSize} />
          </Section>

          <Section title="Contacto">
            <Field label="Celular" value={detail.mobilePhone} />
            <Field label="Teléfono" value={detail.phone} />
            <Field label="Correo" value={detail.email} />
            <Field label="Dirección" value={detail.address} />
            <Field label="Ciudad" value={detail.residenceCity} />
          </Section>

          <Section title="Afiliación">
            <Field label="Perfil" value={detail.profileName} />
            <Field label="Fecha de afiliación" value={detail.joinedOnLabel} />
            <Field label="Registró" value={detail.createdByName} />
            <Field label="Observaciones" value={detail.notes} />
          </Section>

          <Box sx={{ p: 2, mb: 3, borderRadius: '16px', bgcolor: colors.brandTint }}>
            <Typography sx={{ fontWeight: 600, color: colors.textPrincipal, mb: 0.5 }}>
              Cuota vigente
            </Typography>
            <Typography sx={{ color: colors.textPrincipal }}>
              {detail.currentFeeQuote.fullFeeLabel} · {detail.currentFeeQuote.profilePercent.replace('.', ',')} % de {detail.currentFeeQuote.minimumWageLabel}
            </Typography>
            <Typography sx={{ color: colors.textSecondary, fontSize: fontSizes.sm, mt: 0.5 }}>
              Es la cuota plena del perfil actual con el SMMLV vigente. La deuda real está en las cuotas generadas.
            </Typography>
          </Box>

          <Section title="Aportes">
            <Field label="Total aportado" value={detail.totalPaidLabel} />
            <Field
              label="Cuotas pagadas del año"
              value={String(detail.paidFeesThisYear)}
            />
            <Field label="En mora" value={detail.inArrearsLabel} />
          </Section>

          <Section title="Cuotas">
            {detail.fees.length === 0 ? (
              <Typography sx={{ color: colors.textSecondary }}>
                Aún no hay cuotas generadas.
              </Typography>
            ) : (
              detail.fees.map((fee) => <FeeRow key={fee.id} fee={fee} />)
            )}
          </Section>

          <Section title="Beneficios del perfil">
            {detail.benefits.length === 0 ? (
              <Typography sx={{ color: colors.textSecondary }}>
                Este perfil no incluye beneficios.
              </Typography>
            ) : (
              detail.benefits.map((benefit) => (
                <BenefitRow key={benefit.id} benefit={benefit} />
              ))
            )}
          </Section>

          {vm.canEdit ? (
            <HoverIconButton
              text="Editar"
              type="button"
              onClick={() => vm.openEdit(detail)}
              sx={theme.customButtons.secondary}
            />
          ) : null}
        </Box>
      ) : null}
    </Drawer>
  );
}
