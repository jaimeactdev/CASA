import ENV from '@/environments/environment';

export const SESSION_TIMEOUT = ENV.SESSION_TIMEOUT.INACTIVITY_TIMEOUT_MINUTES * 60 * 1000; // Tiempo de inactividad en milisegundos

export const setLastActivityTime = (): void => {
  localStorage.setItem('lastActivityTime', Date.now().toString());
};

export const getLastActivityTime = (): number => {
  const raw = localStorage.getItem('lastActivityTime');
  const parsed = raw ? parseInt(raw, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    const now = Date.now();
    localStorage.setItem('lastActivityTime', now.toString());
    return now;
  }
  return parsed;
};
