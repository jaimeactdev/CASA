'use client';

import React from 'react';
import { Button, Box, CircularProgress, SxProps, Theme } from '@mui/material';

type IconPosition = 'left' | 'right' | 'center';

interface HoverIconButtonProps {
  text: string;
  onClick?: (e?: any) => void;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  sx?: SxProps<Theme>;
  fullWidth?:boolean;
  width?: number;
}

const HoverIconButton: React.FC<HoverIconButtonProps> = ({
  text,
  onClick,
  icon,
  iconPosition = 'center',
  disabled = false,
  loading = false,
  type = 'button',
  form,
  sx = {},
  fullWidth=false,
  width = undefined
}) => {
  const showIcon = !!icon;

  const baseStyles: SxProps<Theme> = {
    position: 'relative',
    overflow: 'hidden',
    width: fullWidth ? '100%' :  (width ? width+'px'  :  '400px'  ) ,
    // justifyContent: iconPosition === 'left' ? 'flex-start' : iconPosition === 'right' ? 'flex-end' : 'center',
    justifyContent: 'center',
    height: '44px',
    minHeight: '44px',
    padding: '0 24px',
    borderRadius: '9999px',
    fontWeight: 500,
    fontSize: '14px',
    '& .text-label': {
      transition: 'opacity 0.3s ease',
      color: 'inherit', // inherit the button color
    },
    '& .icon-hover': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: iconPosition === 'center' ? 'absolute' : 'relative',
      top: iconPosition === 'center' ? '50%' : 'auto',
      left: iconPosition === 'center' ? '50%' : 'auto',
      transform: iconPosition === 'center' ? 'translate(-50%, -50%)' : 'none',
      opacity: 0,
      transition: 'opacity 0.3s ease',
      ...(iconPosition === 'left' && { marginRight: 1 }),
      ...(iconPosition === 'right' && { marginLeft: 1 }),
    },
    '&:hover .icon-hover': {
      opacity: 1,
    },
    '&:hover .text-label': {
      opacity: (iconPosition === 'center' && showIcon) ? 0 : 1,
      color: 'inherit', // keep the button color on hover
    },
    // Keep the label white on hover when there is no icon
    ...(!showIcon && {
      '&:hover': {
        '& .text-label': {
          color: 'inherit',
          opacity: 1,
        },
      },
    }),
    ...sx,
  };

  return (
    <Button
      variant="contained"
      fullWidth={fullWidth}
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled || loading}
      sx={baseStyles}
    >
      {loading ? (
        <CircularProgress size={20} sx={{ mr: 1 }} />
      ) : (
        <>
          {/* Ícono a la izquierda */}
          {iconPosition === 'left' && showIcon && (
            <Box className="icon-hover">{icon}</Box>
          )}

          {/* Texto */}
          <Box className="text-label">{text}</Box>

          {/* Ícono a la derecha */}
          {iconPosition === 'right' && showIcon && (
            <Box className="icon-hover">{icon}</Box>
          )}

          {/* Ícono flotante centrado */}
          {iconPosition === 'center' && showIcon && (
            <Box className="icon-hover">{icon}</Box>
          )}
        </>
      )}
    </Button>
  );
};

export default HoverIconButton;
