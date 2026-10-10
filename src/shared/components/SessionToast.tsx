// src/components/ui/SessionToast.tsx
'use client';

import { Toast } from 'primereact/toast';
import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/core/store/useSessionStore';

export const SessionToast = () => {
  const toastRef = useRef<Toast>(null);
  const toastState = useSessionStore((state) => state.toast);

  useEffect(() => {
    if (toastState?.show) {
      toastRef.current?.clear();
      toastRef.current?.show({
        severity: toastState.icon === 'checkmark-circle'
          ? 'success'
          : toastState.icon === 'alert-circle'
          ? 'error'
          : 'warn',
        summary: toastState.title,
        detail: toastState.description,
        life: 0,
        sticky: true,
      });
    }
  }, [toastState]);

  return <Toast ref={toastRef} position="top-center" />;
};
