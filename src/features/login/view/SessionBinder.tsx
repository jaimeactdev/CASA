'use client';

import { useEffect, useRef } from 'react';
import { getSessionPort } from '@/core/session/sessionPort';
import { useUserStore } from '@/core/store/useUserStore';
import { bindLoginSessionPort } from '@/features/login/session/bindSessionPort';

/**
 * Owns session I/O (login feature).
 * core/AuthGuard and shared/Header only read the store / the registered port.
 */
export function SessionBinder({ children }: { children: React.ReactNode }) {
  bindLoginSessionPort();

  const userEmail = useUserStore((state) => state.user?.email);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const setSessionStatus = useUserStore((state) => state.setSessionStatus);
  const validatedUserEmail = useRef<string | null>(null);

  useEffect(() => {
    if (!userEmail) {
      validatedUserEmail.current = null;
      setSessionStatus('ready');
      return;
    }

    if (validatedUserEmail.current === userEmail) return;

    let cancelled = false;
    setSessionStatus('checking');

    const revalidate = async () => {
      const port = getSessionPort();
      try {
        const confirmed = port ? await port.revalidateCurrentUser() : null;
        if (cancelled) return;
        if (!confirmed?.email) {
          validatedUserEmail.current = null;
          clearUser();
          return;
        }
        validatedUserEmail.current = confirmed.email;
        setUser(confirmed);
      } catch {
        if (cancelled) return;
        validatedUserEmail.current = null;
        clearUser();
      }
    };

    void revalidate();

    return () => {
      cancelled = true;
    };
  }, [userEmail, setUser, clearUser, setSessionStatus]);

  return <>{children}</>;
}
