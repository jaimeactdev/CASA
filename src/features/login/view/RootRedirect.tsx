'use client';

import { useRootRedirectViewModel } from '@/features/login/viewmodel/useRootRedirectViewModel';

export function RootRedirect() {
  useRootRedirectViewModel();
  return null;
}
