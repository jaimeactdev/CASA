import type { ApiErrorTable } from '@/shared/utils/apiErrorUtils';

export type ToastButton = {
  text: string;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
  action?: () => void;
};

export type ToastState = {
  icon?: string;
  lottieAnimation?: string;
  title?: string;
  description?: string;
  /** Validation messages from the remote service, one line each in the modal. */
  errorLines?: string[];
  /** Structured table for remote errors (optional rows/columns in the modal). */
  errorTable?: ApiErrorTable;
  duration?: number;
  show: boolean;
  buttons?: ToastButton[];
};
