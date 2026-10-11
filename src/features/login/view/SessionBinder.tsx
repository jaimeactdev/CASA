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

  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const setSessionStatus = useUserStore((state) => state.setSessionStatus);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;
    setSessionStatus('checking');

    const revalidate = async () => {
      const port = getSessionPort();
      try {
        const confirmed = port ? await port.revalidateCurrentUser() : null;
        if (cancelled) return;
        if (!confirmed?.email) {
          clearUser();
          return;
        }
        setUser(confirmed);
      } catch {
        if (cancelled) return;
        clearUser();
      }
    };

    void revalidate();

    return () => {
      cancelled = true;
    };
  }, [setUser, clearUser, setSessionStatus]);

  return <>{children}</>;
}
