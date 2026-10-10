import React, { useRef } from 'react';
import { Button, SxProps, Theme } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface RippleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

export const RippleHoverButton = ({ children, onClick, sx }: RippleButtonProps) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const theme = useTheme();

  const handleMouseMove = (e: React.MouseEvent) => {
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    btn.style.setProperty('--x', `${x}px`);
    btn.style.setProperty('--y', `${y}px`);
    btn.style.setProperty('--size', `200px`);
  };

  const handleMouseLeave = () => {
    const btn = btnRef.current;
    if (btn) {
      btn.style.setProperty('--size', `0px`);
    }
  };

  return (
    <Button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      variant="contained"
      sx={{ ...theme.customButtons.withRippleHover, ...sx }}
    >
      {children}
    </Button>
  );
};
