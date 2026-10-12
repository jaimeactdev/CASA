'use client';

import Link from 'next/link';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { colors, fontSizes, fontWeights } from '@/styles/designTokens';
import { useHomeViewModel } from '../viewmodel/useHomeViewModel';

export default function HomePage() {
  const theme = useTheme();
  const vm = useHomeViewModel();
  const greeting = vm.userName ? `Hola, ${vm.userName}` : 'Hola';

  return (
    <Box sx={{ p: 1 }}>
      <Typography
        component="h1"
        sx={{
          fontSize: fontSizes.xl,
          fontWeight: fontWeights.semibold,
          color: colors.textPrincipal,
        }}
      >
        Inicio
      </Typography>
      <Typography sx={{ mt: 1, mb: 3, color: colors.textSecondary, maxWidth: 720 }}>
        {greeting}. Resumen de afiliados activos, cuotas del mes y recordatorios
        de beneficios.
      </Typography>

      {vm.loadError ? (
        <Typography sx={{ color: colors.error, mb: 2 }}>{vm.loadError}</Typography>
      ) : null}

      {vm.wageIsZero ? (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: '16px',
            bgcolor: colors.warningBg,
            color: colors.warningText,
          }}
        >
          <Typography sx={{ fontWeight: fontWeights.semibold }}>
            Falta configurar el SMMLV vigente.
          </Typography>
          <Typography sx={{ fontSize: fontSizes.sm, mt: 0.5 }}>
            El salario mínimo está en 0. Mientras siga así no se generan cuotas ni
            se pueden crear afiliados.
          </Typography>
          {vm.settingsHref ? (
            <Button
              component={Link}
              href={vm.settingsHref}
              sx={{ ...theme.customButtons.secondary, mt: 2 }}
            >
              Ir a parámetros
            </Button>
          ) : null}
        </Paper>
      ) : null}

      {vm.reminders.length > 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: '16px',
            bgcolor: colors.infoBg,
            color: colors.infoText,
          }}
        >
          <Typography sx={{ fontWeight: fontWeights.semibold }}>
            Recordatorio del mes
          </Typography>
          {vm.reminders.map((item) => (
            <Typography key={item.id} sx={{ fontSize: fontSizes.sm, mt: 0.5 }}>
              {item.text}
            </Typography>
          ))}
        </Paper>
      ) : null}

      {vm.loaded ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            mb: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              lg: '1fr 1fr 1fr 1fr',
            },
          }}
        >
          {vm.cards.map((card) => (
            <Paper
              key={card.key}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: colors.surface0,
              }}
            >
              <Typography sx={{ color: colors.textSecondary, fontSize: fontSizes.sm }}>
                {card.label}
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: fontSizes.h2,
                  fontWeight: fontWeights.bold,
                  color: card.alert ? colors.errorText : colors.textPrincipal,
                }}
              >
                {card.value}
              </Typography>
              <Typography sx={{ mt: 0.5, color: colors.textSecondary, fontSize: fontSizes.sm }}>
                {card.hint}
              </Typography>
            </Paper>
          ))}
        </Box>
      ) : null}

      <Typography
        sx={{
          mb: 1.5,
          fontWeight: fontWeights.semibold,
          color: colors.textPrincipal,
        }}
      >
        Accesos
      </Typography>
      {vm.shortcuts.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {vm.shortcuts.map((item) => (
            <Button
              key={item.key}
              component={Link}
              href={item.href}
              sx={theme.customButtons.secondary}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      ) : (
        <Typography sx={{ color: colors.textSecondary }}>
          Tu rol no incluye accesos a afiliados, pagos ni entregas.
        </Typography>
      )}
    </Box>
  );
}
