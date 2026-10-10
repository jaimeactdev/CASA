'use client';
import { ReactNode } from 'react';
import useSessionTimeout from '@/hooks/useSessionTimeout';

interface SessionTimeoutProviderProps {
  children: ReactNode;
}

/**
 * Provider that enables session-timeout control.
 * Runs on every route while a session is active.
 */
const SessionTimeoutProvider: React.FC<SessionTimeoutProviderProps> = ({ children }) => {
  // The hook decides whether the current route needs timeout and returns the modal
  const { SessionTimeoutModalComponent } = useSessionTimeout();

  return (
    <>
      {children}
      {SessionTimeoutModalComponent}
    </>
  );
};

export default SessionTimeoutProvider;