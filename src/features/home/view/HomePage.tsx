'use client';

import { Box, Typography } from '@mui/material';
import { useHomeViewModel } from '../viewmodel/useHomeViewModel';

const HomePage = () => {
  const { isSignedIn, userName } = useHomeViewModel();

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {isSignedIn ? `Hola${userName ? `, ${userName}` : ''}` : 'Bienvenido'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
        {isSignedIn
          ? 'Este será el inicio del panel: afiliados activos, cuotas pendientes y morosas, y recordatorios de beneficios.'
          : 'Inicia sesión con tu correo y clave para gestionar afiliados, pagos y beneficios.'}
      </Typography>
    </Box>
  );
};

export default HomePage;
