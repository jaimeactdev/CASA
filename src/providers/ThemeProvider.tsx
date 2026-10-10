'use client';

import { ThemeProvider } from '@mui/material/styles';
import theme from '@/styles/theme';

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}