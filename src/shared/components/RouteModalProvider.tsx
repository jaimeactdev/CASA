'use client';

import React from 'react';
import { useRouteModal } from '@/shared/hooks/useRouteModal';

interface RouteModalProviderProps {
  children: React.ReactNode;
}

export const RouteModalProvider: React.FC<RouteModalProviderProps> = ({ children }) => {
  // Este hook se ejecutará en cada cambio de ruta
  useRouteModal();

  return <>{children}</>;
};