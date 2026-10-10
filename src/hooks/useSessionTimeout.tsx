'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SESSION_TIMEOUT, setLastActivityTime, getLastActivityTime } from '@/core/utils/sessionTimeout';
import {  getRouteStatus, isSessionControlledRoute } from '@/core/utils/restrictedRoutes';
import { useMenuItems } from '@/shared/layouts/menuItems';
import { useSessionStore } from '@/core/store/useSessionStore';
import { useUserStore } from '@/core/store/useUserStore';
import SessionTimeoutModal from '@/shared/components/SessionTimeoutModal';
import React from 'react';
import ENV from '@/environments/environment';

interface UseSessionTimeoutReturn {
  SessionTimeoutModalComponent: React.ReactElement | null;
}

const useSessionTimeout = (): UseSessionTimeoutReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const menuItems = useMenuItems();
   const clearUser = useUserStore((state) => state.clearUser);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | undefined>(undefined);

  const MODAL_TIMEOUT = ENV.SESSION_TIMEOUT.MODAL_COUNTDOWN_MINUTES * 60 * 1000;
  const TOTAL_TIMEOUT = SESSION_TIMEOUT + MODAL_TIMEOUT;
  
  // Check whether there is an active session
  const hasActiveSession = isAuthenticated || user !== null;
  
  // Current route info (only when pathname is not null)
  const routeStatus = pathname ? getRouteStatus(pathname, menuItems) : null;
  const isSessionControlled = pathname ? isSessionControlledRoute(pathname, menuItems) : false;
  //const isRestricted = pathname ? isRestrictedRoute(pathname, menuItems) : false;

  // Sign-out handler
  const handleLogout = useCallback(() => {
    setShowSessionModal(false);   
    clearUser();
    router.push('/login');
 //   console.log('🔴 User logged out from session timeout modal');
  }, [clearUser, router]);

  // Continue-working handler
  const handleContinueWorking = useCallback(() => {
    setLastActivityTime(); // refresh activity timestamp
    setShowSessionModal(false); // close modal
  //  console.log('🟢 User continued working - session extended');
  }, []);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    // Events that count as user activity (including form interactions)
    const events = ['click', 'keydown', 'input', 'change', 'focus'];
    
    // Debug: current route info
    /*console.log('🔍 ROUTE DEBUG:', {
      pathname,
      routeStatus,
      isSessionControlled,
      isRestricted,
      hasActiveSession,
      menuItemsLength: menuItems.length
    });*/

    // Refresh activity (runs on every route while a session is active)
    const resetTimeout = (): void => {
      if (hasActiveSession) {
        const lastActivityTime = getLastActivityTime();
        const currentTime = Date.now();
        const timeDifference = currentTime - lastActivityTime;
        
        // If inactivity already exceeded the limit, sign out immediately
        // instead of resetting the counter
        if (timeDifference > SESSION_TIMEOUT) {
          if (timeDifference > TOTAL_TIMEOUT) {
            handleLogout();
          }
          return;
        }

        setLastActivityTime();
        //console.log('🟢 Activity updated:', newTime, 'on route:', pathname, 'status:', routeStatus, 'hasActiveSession:', hasActiveSession);
      } else {
       // console.log('⚪ No active session - activity NOT updated on route:', pathname, 'status:', routeStatus, 'hasActiveSession:', hasActiveSession);
      }
    };

    // Check timeout (on routes with status R or A)
    const checkTimeout = (): void => {
      const lastActivityTime = getLastActivityTime();
      const currentTime = Date.now();
      const timeDifference = currentTime - lastActivityTime;

      if (timeDifference > SESSION_TIMEOUT) {
         if (timeDifference > TOTAL_TIMEOUT) {
            handleLogout();
         } else {
            const remaining = Math.max(0, Math.floor((TOTAL_TIMEOUT - timeDifference) / 1000));
            setRemainingSeconds(remaining);
            setShowSessionModal(true);
         }
      } else {
         // Reset state if we are back within limits (e.g. activity in another tab)
         if (showSessionModal) {
             setShowSessionModal(false);
         }
      }
    };

    // Initial check: evaluate timeout BEFORE attaching listeners (every route with an active session)
    if (hasActiveSession) {
      const initialLastActivityTime = getLastActivityTime();
      const initialCurrentTime = Date.now();
      const initialTimeDifference = initialCurrentTime - initialLastActivityTime;
      
     // console.log('🔍 INITIAL VALIDATION for route with active session:', pathname, 'status:', routeStatus);
    //  console.log('Initial time difference (minutes):', Math.floor(initialTimeDifference / (1000 * 60)));
      
      if (initialTimeDifference > SESSION_TIMEOUT) {
        if (initialTimeDifference > TOTAL_TIMEOUT) {
           handleLogout();
           return;
        } else {
           const remaining = Math.max(0, Math.floor((TOTAL_TIMEOUT - initialTimeDifference) / 1000));
           setRemainingSeconds(remaining);
           setShowSessionModal(true);
        }
      }
    }

    // Attach listeners and interval on every route while a session is active
    let intervalId: NodeJS.Timeout | null = null;
    
    if (hasActiveSession) {
      // Activity listeners on every route while a session is active
   //   console.log('🔄 Setting up activity listeners for route:', pathname, 'status:', routeStatus, 'hasActiveSession:', hasActiveSession);
      
      // Attach listeners after the initial render
      setTimeout(() => {
        events.forEach(event => {
          window.addEventListener(event, resetTimeout);
        });
      }, 100);
      
      // Poll timeout on every route while a session is active
    //  console.log('⏰ Setting up timeout interval for route with active session:', pathname, 'status:', routeStatus);
      intervalId = setInterval(checkTimeout, 1000);
      // Run checkTimeout immediately for debug
      checkTimeout();
    } else {
     // console.log('⚪ No active session - no listeners or timeout check for route:', pathname, 'status:', routeStatus, 'hasActiveSession:', hasActiveSession);
    }

    return () => {
      // Remove listeners if a session is active
      if (hasActiveSession) {
        // Delay removal so it happens after the listeners were attached
        setTimeout(() => {
          events.forEach(event => {
            window.removeEventListener(event, resetTimeout);
          });
        }, 150);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [router, pathname, menuItems, isAuthenticated, user, hasActiveSession, routeStatus, isSessionControlled, handleLogout]);

  // Session timeout modal
  const SessionTimeoutModalComponent = showSessionModal ? (
    <SessionTimeoutModal
      open={showSessionModal}
      onContinueWorking={handleContinueWorking}
      onLogout={handleLogout}
      timeoutMinutes={ENV.SESSION_TIMEOUT.MODAL_COUNTDOWN_MINUTES}
      initialRemainingSeconds={remainingSeconds}
    />
  ) : null;

  return {
    SessionTimeoutModalComponent
  };
};

export default useSessionTimeout;
