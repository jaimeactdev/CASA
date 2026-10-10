"use client";

import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import HoverIconButton from "@/shared/ui/mui/HoverIconButton";
import InputFieldMUI from "@/shared/ui/mui/InputFieldMUI";
import PasswordFieldMUI from "@/shared/ui/mui/PasswordFieldMUI";
import { useUserStore } from "@/core/store/useUserStore";
import { useLoginViewModel } from "../viewmodel/useLoginViewModel";
import { colors, fontSizes } from "@/styles/designTokens";
import { appConfig } from "@/config/appConfig";
import { BrandLogo } from "@/shared/ui/brand/BrandLogo";

export function LoginPage() {
  const theme = useTheme();
  const hydrate = useUserStore((state) => state.hydrateFromLocalStorage);
  const {
    values,
    errors,
    formError,
    isSubmitting,
    onChangeEmail,
    onChangePassword,
    onSubmit,
  } = useLoginViewModel();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        minHeight: "100vh",
        px: 2,
        py: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 420,
          transform: "translateY(-32px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: colors.surface0,
            borderRadius: "16px",
            px: 2.5,
            py: 1.5,
            mb: 4,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          }}
        >
          <BrandLogo variant="login" height={56} />
        </Box>

        <Box
          component="form"
          onSubmit={onSubmit}
          noValidate
          sx={{
            width: "90%",
            bgcolor: colors.surface0,
            borderRadius: "24px",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
            pt: 4,
            px: { xs: 3, sm: 4 },
            pb: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: colors.textBody,
                fontWeight: 700,
                fontSize: { xs: fontSizes.lg, sm: fontSizes.h3 },
                textAlign: "center",
                lineHeight: 1.3,
                mb: 0.5,
              }}
            >
              Bienvenido a{" "}
              <Box component="span" sx={{ color: colors.brand }}>
                {appConfig.name}
              </Box>
            </Typography>

            <Typography
              component="p"
              sx={{
                color: colors.textSecondary,
                fontSize: fontSizes.md,
                textAlign: "center",
              }}
            >
              {appConfig.tagline}
            </Typography>
          </Box>

          <InputFieldMUI
            name="email"
            label="Correo"
            value={values.email}
            onChange={onChangeEmail}
            error={errors.email}
            keyfilter="email"
            maxlenght={120}
          />

          <PasswordFieldMUI
            name="password"
            label="Clave"
            value={values.password}
            onChange={onChangePassword}
            error={errors.password}
            maxlenght={128}
          />

          {formError && (
            <Typography
              role="alert"
              sx={{
                color: colors.errorText,
                bgcolor: colors.errorBg,
                borderRadius: "16px",
                px: 2,
                py: 1.25,
                fontSize: fontSizes.sm,
              }}
            >
              {formError}
            </Typography>
          )}

          <HoverIconButton
            text="Ingresar"
            type="submit"
            fullWidth
            loading={isSubmitting}
            sx={theme.customButtons.primary}
          />

          <Typography
            component="p"
            sx={{
              color: colors.textSecondary,
              fontSize: fontSizes.sm,
              textAlign: "center",
            }}
          >
            Acceso exclusivo para el personal de la asociación
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
