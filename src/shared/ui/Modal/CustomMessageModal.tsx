// src/components/ui/CustomMessageModal.tsx
'use client';

import {
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import { useEffect, useState } from 'react';
import { useSessionStore } from '@/core/store/useSessionStore';
import theme from '@/styles/theme';
import Image from 'next/image';
import Lottie from 'lottie-react';
import { APP_TOAST_Z_INDEX } from '@/shared/layout/appShellConstants';
import AppDialog from '@/shared/ui/Modal/AppDialog';

export const CustomMessageModal = () => {
  const toastState = useSessionStore((state) => state.toast);
  

  const hideToast = useSessionStore((state) => state.hideToast);

  const isOpen = toastState?.show ?? false;
  const hasErrorTable = Boolean(toastState?.errorTable?.rows?.length);
  const buttons = toastState?.buttons?.length
    ? toastState.buttons
    : [{ text: 'Aceptar' }];
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    if (!toastState?.lottieAnimation) {
      setAnimationData(null);
      return;
    }

    let cancelled = false;
    fetch(toastState.lottieAnimation)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [toastState?.lottieAnimation]);

  // Image lookup based on the icon name
  const getImage = () => {
    switch (toastState?.icon) {
      case 'checkmark-circle': 
        return '/modal/success.png';
      case 'alert-circle':
        return '/modal/error_icon.png';
      case 'info':
        return '/modal/info_icon.svg';
      default:
        return '/modal/warn_icon.png';
    }
  };

  return (
    <AppDialog
      open={isOpen}
      onClose={hideToast}
      disableEscapeKeyDown
      maxWidth={hasErrorTable ? 'md' : 'xs'}
      fullWidth
      sx={{ zIndex: APP_TOAST_Z_INDEX }}
    >
      <DialogTitle sx={{ textAlign: 'right', p: 1 }}>
        <IconButton onClick={hideToast}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          {/* Mostrar Lottie si existe, de lo contrario imagen */}
          {animationData ? (
            <Lottie animationData={animationData} loop autoplay style={{ width: 120, height: 120 }} />
          ) 
          : (
            <Image src={getImage()} alt="Logo" width={80} height={80} priority />
          )}
        </Box>
        <Typography variant="h6" gutterBottom>
          {toastState?.title}
        </Typography>
        {toastState?.errorTable?.rows?.length ? (
          <Box sx={{ my: 2 }}>
            {toastState.errorTable.summary ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, textAlign: 'left' }}>
                {toastState.errorTable.summary}
              </Typography>
            ) : null}
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ maxHeight: 360, textAlign: 'left' }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Insumo</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Período</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {toastState.errorTable.rows.map((row) => (
                    <TableRow key={`${row.id}-${row.nombre}-${row.periodo}`}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {row.nombre}
                      </TableCell>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.categoria}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.periodo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : toastState?.errorLines?.length ? (
          <Box
            component="ul"
            sx={{
              textAlign: 'left',
              pl: 2.5,
              my: 1,
              listStyleType: 'disc',
            }}
          >
            {toastState.errorLines.map((line, index) => (
              <Typography
                component="li"
                variant="body2"
                key={`${index}-${line}`}
                sx={{ mb: 0.75, display: 'list-item' }}
              >
                {line}
              </Typography>
            ))}
          </Box>
        ) : toastState?.description ? (
          <Typography variant="body1">
            {toastState.description}
          </Typography>
        ) : null}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        {buttons.map((btn, index) => (
          <HoverIconButton
            key={index}
            text={btn.text}
            width={150}
            sx={theme.customButtons.primary}
            onClick={() => {
              if (btn.action) btn.action();
              hideToast();
            }}
          />
        ))}
      </Box>
      </DialogContent>
    </AppDialog>
  );
};
