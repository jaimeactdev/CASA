'use client';

import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Feature skeleton for the template.
 * Copy this folder as the starting point of a new module
 * (data → domain → viewmodel → view).
 */
export function EjemploView() {
  const theme = useTheme();

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Página de ejemplo
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 560 }}>
        Usa este módulo como referencia al crear features nuevas. Los componentes
        compartidos están en <code>src/shared/ui</code>.
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          maxWidth: 480,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Capas sugeridas
        </Typography>
        <Typography component="ul" variant="body2" sx={{ m: 0, pl: 2 }}>
          <li>data/repositories — llamadas HTTP</li>
          <li>domain — tipos y servicios</li>
          <li>viewmodel — estado y lógica de UI</li>
          <li>view — componentes React</li>
        </Typography>
      </Paper>
    </Box>
  );
}
