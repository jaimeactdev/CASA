// src/hooks/ToastProvider.tsx

'use client';

import React, { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';
import type { ToastMessage } from 'primereact/toast';

interface ToastContextProps {
  showMessageToast: (
    severity: ToastMessage['severity'],
    title: string,
    message: string,
    timeLift?: number
  ) => void;
  clearMessagesToast: () => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toastRef = useRef<Toast>(null);

  const showMessageToast = (
    severity: ToastMessage['severity'],
    title: string,
    message: string,
    timeLift: number = 0
  ) => {
    toastRef.current?.clear();
    toastRef.current?.show({
      severity,
      summary: title,
      detail: message,
      life: timeLift,
      sticky: timeLift <= 0,
    });
  };

  const clearMessagesToast = () => {
    toastRef.current?.clear();
  };

  return (
    <ToastContext.Provider value={{ showMessageToast, clearMessagesToast }}>
      <Toast ref={toastRef} position="top-center" />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
