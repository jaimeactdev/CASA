'use client';

import React from 'react';
import { useSessionStore } from '@/core/store/useSessionStore';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

export const LoaderGlobal = () => {
  const loading = useSessionStore((state) => state.loading);

   const theme = useTheme();

   

  if (!loading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
      }}
    >
      <CircularProgress sx={{ color: theme.palette.primary.main }}/>
    </Box>
  );
};
