'use client';

import { Box, Typography } from '@mui/material';
import { colors, fontSizes } from '@/styles/designTokens';

export function ModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Box sx={{ p: 1 }}>
      <Typography
        component="h1"
        sx={{ fontSize: fontSizes.xl, fontWeight: 600, color: colors.textPrincipal }}
      >
        {title}
      </Typography>
      <Typography sx={{ mt: 1, color: colors.textSecondary }}>
        {description}
      </Typography>
    </Box>
  );
}
