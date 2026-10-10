// src/shared/hooks/useRouteModal.ts
'use client';

import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSessionStore } from '@/core/store/useSessionStore';
import { getActiveRouteModalConfig } from '@/config/routeModalConfig';

/**
 * Hook for route-configured modals.
 * @returns whether a modal should show and the matching config
 */
export const useRouteModal = () => {
  const pathname = usePathname();
  const setToast = useSessionStore((state) => state.setToast);
  const hideToast = useSessionStore((state) => state.hideToast);
  const toastState = useSessionStore((state) => state.toast);


  // Resolve the modal config for the current route (memoized)
  const routeConfig = useMemo(() => {
    return pathname ? getActiveRouteModalConfig(pathname) : undefined;
  }, [pathname]);
  
  const shouldShowModal = routeConfig !== undefined;

  useEffect(() => {
    if (routeConfig) {
      // Show the modal through the existing toast system
      setToast({
        show: true,
        title: routeConfig.title,
        description: routeConfig.message,
        icon: routeConfig.icon || 'alert-circle',
        lottieAnimation: routeConfig.lottieAnimation,
        buttons: routeConfig.buttons || [
          {
            text: 'Cerrar',
            variant: 'contained',
            color: 'primary'
          }
        ],
        duration: 0 // do not auto-hide route modals
      });
    } else {
      // No config for this route: hide an active route modal (duration: 0)
      const currentToastState = useSessionStore.getState().toast;
      if (currentToastState?.show && currentToastState?.duration === 0) {
        hideToast();
      }
    }
  }, [routeConfig, setToast, hideToast]);

  return {
    shouldShowModal,
    routeConfig,
    isModalOpen: toastState?.show && toastState?.duration === 0
  };
};

/**
 * Hook simplificado que solo retorna si debe mostrar el modal
 * @returns boolean indicando si debe mostrar el modal
 */
export const useShouldShowRouteModal = (): boolean => {
  const { shouldShowModal } = useRouteModal();
  return shouldShowModal;
};