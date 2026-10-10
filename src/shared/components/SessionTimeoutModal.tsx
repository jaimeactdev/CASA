'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';

interface SessionTimeoutModalProps {
  open: boolean;
  onContinueWorking: () => void;
  onLogout: () => void;
  timeoutMinutes?: number;
  initialRemainingSeconds?: number;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  open,
  onContinueWorking,
  onLogout,
  timeoutMinutes = 4,
  initialRemainingSeconds
}) => {
  const theme = useTheme();
  const [countdown, setCountdown] = useState(
    initialRemainingSeconds !== undefined ? initialRemainingSeconds : timeoutMinutes * 60
  );
  const [shouldLogout, setShouldLogout] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset logic only if we are closing
      return;
    }
    
    // If open changes to true, we might want to update countdown if prop changed
    // But typically we mount/unmount. 
    // If we receive a new initialRemainingSeconds while open, we might want to sync?
    // For now, let's rely on the initial state setter for mount.
    // However, if the component stays mounted and open toggles, we need to reset.
    setCountdown(initialRemainingSeconds !== undefined ? initialRemainingSeconds : timeoutMinutes * 60);
    setShouldLogout(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Countdown finished, sign out
          setShouldLogout(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, timeoutMinutes, initialRemainingSeconds]);

  // Efecto separado para manejar el logout
  useEffect(() => {
    if (shouldLogout) {
      onLogout();
    }
  }, [shouldLogout, onLogout]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMinutesText = (): string => {
    const minutes = Math.ceil(countdown / 60);
    return minutes === 1 ? '1 minuto' : `${minutes} minutos`;
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          padding: '16px',
          textAlign: 'center'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={onLogout}
          sx={{
            position: 'absolute',
            right: -8,
            top: -8,
            color: theme.palette.grey[500]
          }}
        >
         
        </IconButton>
      </Box>

      <DialogContent sx={{ textAlign: 'center', pt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <NotificationsIcon 
            sx={{ 
              fontSize: 64, 
              color: theme.palette.primary.main,
              mb: 2
            }} 
          />
        </Box>
        
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 2
          }}
        >
          ¿Sigues conectado?
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: theme.palette.text.secondary,
            mb: 1
          }}
        >
          Tu sesión se cerrará en {getMinutesText()}.
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.palette.text.secondary,
            fontSize: '0.875rem'
          }}
        >
          Tiempo restante: {formatTime(countdown)}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>

        
        <Button
          onClick={onContinueWorking}
          sx={theme.customButtons.primary}
        >
          Continuar trabajando
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutModal;