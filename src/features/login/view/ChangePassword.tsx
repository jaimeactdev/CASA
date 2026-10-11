'use client';

import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import PasswordFieldMUI from '@/shared/ui/mui/PasswordFieldMUI';
import { BrandLogo } from '@/shared/ui/brand/BrandLogo';
import { appConfig } from '@/config/appConfig';
import { colors, fontSizes } from '@/styles/designTokens';
import { useChangePasswordViewModel } from '../viewmodel/useChangePasswordViewModel';

export function ChangePasswordPage() {
  const theme = useTheme();
  const {
    values,
    errors,
    formError,
    isSubmitting,
    onChangeCurrent,
    onChangeNew,
    onChangeConfirm,
    onSubmit,
  } = useChangePasswordViewModel();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        minHeight: '100vh',
        px: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: colors.surface0,
          borderRadius: '24px',
          pt: 4,
          px: { xs: 3, sm: 4 },
          pb: 4,
          boxShadow: colors.brandShadowStrong,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <BrandLogo variant="login" />
        </Box>
        <Box>
          <Typography
            component="h1"
            sx={{
              textAlign: 'center',
              fontSize: fontSizes.xl,
              fontWeight: 600,
              color: colors.textPrincipal,
              mb: 0.5,
            }}
          >
            Cambia tu clave
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: colors.textSecondary,
            }}
          >
            Por seguridad, {appConfig.name} pide una clave nueva en el primer
            ingreso.
          </Typography>
        </Box>

        <PasswordFieldMUI
          name="currentPassword"
          label="Clave actual"
          value={values.currentPassword}
          onChange={onChangeCurrent}
          error={errors.currentPassword}
          maxlenght={128}
        />
        <PasswordFieldMUI
          name="newPassword"
          label="Clave nueva"
          value={values.newPassword}
          onChange={onChangeNew}
          error={errors.newPassword}
          maxlenght={128}
        />
        <PasswordFieldMUI
          name="confirmPassword"
          label="Confirmar clave nueva"
          value={values.confirmPassword}
          onChange={onChangeConfirm}
          error={errors.confirmPassword}
          maxlenght={128}
        />

        {formError ? (
          <Typography sx={{ color: colors.error, mt: 1, mb: 1 }}>
            {formError}
          </Typography>
        ) : null}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <HoverIconButton
            text="Guardar clave"
            type="submit"
            disabled={isSubmitting}
            sx={theme.customButtons.primary}
          />
        </Box>
      </Box>
    </Box>
  );
}
