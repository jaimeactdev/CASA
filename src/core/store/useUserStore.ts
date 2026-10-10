import { create } from 'zustand';
import type { SessionStatus } from '@/core/guards/resolveAuthGate';

export interface User {
  id?: string;
  name?: string;
  email?: string;
  rol?: string;
  permissions?: string[];
  mustChangePassword?: boolean;
}

interface UserState {
  user: User | null;
  sessionStatus: SessionStatus;
  setUser: (user: User) => void;
  setSessionStatus: (sessionStatus: SessionStatus) => void;
  clearUser: () => void;
  loadUser: () => void;
  hydrateFromLocalStorage: () => void;
}

const loadInitialUser = (): User | null => {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
};

export const useUserStore = create<UserState>((set) => {
  const initialUser = loadInitialUser();

  return {
    user: initialUser,
    sessionStatus: initialUser ? 'unknown' : 'ready',

    setUser: (user: User) => {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, sessionStatus: 'ready' });
    },

    setSessionStatus: (sessionStatus: SessionStatus) => {
      set({ sessionStatus });
    },

    clearUser: () => {
      localStorage.removeItem('user');
      set({ user: null, sessionStatus: 'ready' });
    },

    loadUser: () => {
      const stored = localStorage.getItem('user');
      if (stored) set({ user: JSON.parse(stored) });
    },

    hydrateFromLocalStorage: () => {
      const storedUser = loadInitialUser();
      set({
        user: storedUser,
        sessionStatus: storedUser ? 'unknown' : 'ready',
      });
    },
  };
});
