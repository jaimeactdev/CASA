export const ENV = {
  BACKEND: {
    // Same-origin Route Handlers under src/app/api.
    URL_BASE: process.env.NEXT_PUBLIC_BACKEND_URL_BASE || "/api",
  },

  SESSION_TIMEOUT: {
    MODAL_COUNTDOWN_MINUTES: Number(
      process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MODAL_COUNTDOWN_MINUTES ?? 3,
    ),
    INACTIVITY_TIMEOUT_MINUTES: Number(
      process.env.NEXT_PUBLIC_SESSION_TIMEOUT_INACTIVITY_TIMEOUT_MINUTES ?? 30,
    ),
  },
};

export default ENV;
