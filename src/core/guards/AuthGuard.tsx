'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/core/store/useUserStore';
import {
  isAuthRequiredPath,
  resolveAuthGate,
} from '@/core/guards/resolveAuthGate';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const userEmail = useUserStore((state) => state.user?.email);
  const sessionStatus = useUserStore((state) => state.sessionStatus);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const decision = resolveAuthGate({
      pathname,
      userEmail,
      sessionStatus,
    });

    if (decision.allow) {
      setAuthorized(true);
      return;
    }

    if (decision.reason === 'wait') {
      setAuthorized(false);
      return;
    }

    router.push('/login');
    setAuthorized(false);
  }, [pathname, userEmail, sessionStatus, router]);

  let currentPath = pathname || '';
  if (currentPath.endsWith('/') && currentPath.length > 1) {
    currentPath = currentPath.slice(0, -1);
  }

  if (!authorized && isAuthRequiredPath(currentPath)) {
    return null;
  }

  return <>{children}</>;
}
