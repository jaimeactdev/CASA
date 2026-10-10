// src/core/store/useSessionStore.ts

import { create } from 'zustand';
import type { ApiErrorTable } from '@/shared/utils/apiErrorUtils';

export type ToastButton = {
  text: string;
  variant?: 'contained' | 'outlined' | 'text';  // opcional
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
  action?: () => void;
};


interface ToastConfig {
  icon?: string; // static icon
  lottieAnimation?: string; // optional Lottie animation path
  title?: string;
  description?: string;
  errorLines?: string[];
  errorTable?: ApiErrorTable;
  show?: boolean;
  duration?: number;
  buttons?: ToastButton[];
}


interface SessionState {
  isAuthenticated: boolean;
  userInfo: unknown;
  acctId?: string;
  loading: boolean;
  toast?: ToastConfig;
  setIsAuthenticated: (userInfo: unknown) => void;
  logout: () => void;
  setCurrenAcctId: (acctId: string) => void;
  setLoading: (value: boolean) => void;
  setToast: (toast: SessionState['toast']) => void;
  hideToast: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: false,
  userInfo: null,
  acctId: undefined,
  loading: false,
  toast: undefined,

  setIsAuthenticated: (userInfo) =>
    set({ isAuthenticated: true, userInfo }),

  logout: () =>
    set({ isAuthenticated: false, userInfo: null, acctId: undefined }),

  setCurrenAcctId: (acctId) =>
    set({ acctId }),

  setLoading: (value) =>
    set({ loading: value }),

  setToast: (toast) =>
    set({ toast }),

  hideToast: () =>
    set({ toast: { show: false } }),
}));
