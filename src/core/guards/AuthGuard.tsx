'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/core/store/useUserStore';
import {
  CHANGE_PASSWORD_ROUTE,
  isAuthRequiredPath,
  resolveAuthGate,
} from '@/core/guards/resolveAuthGate';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const userEmail = useUserStore((state) => state.user?.email);
  const mustChangePassword = useUserStore(
    (state) => state.user?.mustChangePassword,
  );
  const sessionStatus = useUserStore((state) => state.sessionStatus);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const decision = resolveAuthGate({
      pathname,
      userEmail,
      sessionStatus,
      mustChangePassword,
    });

    if (decision.allow) {
      setAuthorized(true);
      return;
    }

    if (decision.reason === 'wait') {
      setAuthorized(false);
      return;
    }

    if (decision.reason === 'redirect-password') {
      router.replace(CHANGE_PASSWORD_ROUTE);
      setAuthorized(false);
      return;
    }

    router.push('/login');
    setAuthorized(false);
  }, [pathname, userEmail, sessionStatus, mustChangePassword, router]);

  if (!authorized && isAuthRequiredPath(pathname)) {
    return null;
  }

  return <>{children}</>;
}
