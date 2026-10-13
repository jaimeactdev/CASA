'use client';

import Link from 'next/link';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BrandLogo } from '@/shared/ui/brand/BrandLogo';
import { chrome, colors, fontSizes, fontWeights } from '@/styles/designTokens';
import { useSiteViewModel } from '../viewmodel/useSiteViewModel';

function contactHref(label: string, value: string): string | null {
  if (label === 'Teléfono') return `tel:${value.replace(/\s/g, '')}`;
  if (label === 'Correo') return `mailto:${value}`;
  return null;
}

export function SiteView() {
  const theme = useTheme();
  const vm = useSiteViewModel();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: chrome.canvasBg }}>
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          px: { xs: 2, md: 4 },
          py: 2,
          bgcolor: colors.surface0,
          borderBottom: `2px solid ${colors.brand}`,
        }}
      >
        <BrandLogo variant="full" height={40} />
        <Button component={Link} href="/login" sx={theme.customButtons.ghost}>
          Ingreso del personal
        </Button>
      </Box>

      <Box component="main" sx={{ maxWidth: 960, mx: 'auto', px: 2, py: { xs: 3, md: 5 } }}>
        {vm.loading ? (
          <Typography sx={{ color: colors.textSecondary }}>Cargando…</Typography>
        ) : null}

        {vm.loadError ? (
          <Typography sx={{ color: colors.error, mb: 2 }}>{vm.loadError}</Typography>
        ) : null}

        {vm.loaded ? (
          <>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 4 },
                mb: 3,
                borderRadius: '24px',
                bgcolor: colors.surface0,
              }}
            >
              {vm.acronym ? (
                <Typography sx={{ color: colors.textPrincipal, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>
                  {vm.acronym}
                </Typography>
              ) : null}
              <Typography
                component="h1"
                sx={{
                  mt: vm.acronym ? 1 : 0,
                  fontSize: fontSizes.h1,
                  fontWeight: fontWeights.bold,
                  color: colors.textPrincipal,
                }}
              >
                {vm.name}
              </Typography>
              <Typography sx={{ mt: 2, maxWidth: 640, color: colors.textBody, fontSize: fontSizes.lg }}>
                {vm.presentation}
              </Typography>
            </Paper>

            <Typography
              component="h2"
              sx={{ mb: 1.5, fontSize: fontSizes.h3, fontWeight: fontWeights.semibold, color: colors.textPrincipal }}
            >
              Beneficios
            </Typography>
            {vm.benefits.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  mb: 4,
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                }}
              >
                {vm.benefits.map((benefit) => (
                  <Paper
                    key={benefit.id}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: '16px',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: colors.surface0,
                    }}
                  >
                    <Typography
                      component="h3"
                      sx={{ fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, color: colors.textPrincipal }}
                    >
                      {benefit.name}
                    </Typography>
                    <Typography sx={{ mt: 1, color: colors.textBody }}>{benefit.publicText}</Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography sx={{ mb: 4, color: colors.textSecondary }}>
                Por ahora no hay beneficios publicados.
              </Typography>
            )}

            <Typography
              component="h2"
              sx={{ mb: 1.5, fontSize: fontSizes.h3, fontWeight: fontWeights.semibold, color: colors.textPrincipal }}
            >
              Cómo afiliarse
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 4,
                borderRadius: '16px',
                bgcolor: colors.brandTint,
              }}
            >
              <Typography sx={{ color: colors.textBody }}>{vm.affiliation}</Typography>
            </Paper>

            {vm.contact.length > 0 ? (
              <>
                <Typography
                  component="h2"
                  sx={{ mb: 1.5, fontSize: fontSizes.h3, fontWeight: fontWeights.semibold, color: colors.textPrincipal }}
                >
                  Contacto
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: colors.surface0,
                  }}
                >
                  {vm.contact.map((row) => {
                    const href = contactHref(row.label, row.value);
                    return (
                      <Typography key={row.label} sx={{ mt: 1, color: colors.textBody, '&:first-of-type': { mt: 0 } }}>
                        <Box component="span" sx={{ fontWeight: fontWeights.semibold }}>
                          {row.label}:{' '}
                        </Box>
                        {href ? (
                          <Box
                            component="a"
                            href={href}
                            sx={{ color: colors.brand, textDecoration: 'underline' }}
                          >
                            {row.value}
                          </Box>
                        ) : (
                          row.value
                        )}
                      </Typography>
                    );
                  })}
                </Paper>
              </>
            ) : null}
          </>
        ) : null}
      </Box>
    </Box>
  );
}
