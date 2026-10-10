/** Height of the fixed header container (see headerContainerStyles). */
export const APP_HEADER_HEIGHT_PX = 100;

/** z-index of the fixed navbar (below the modal). */
export const APP_HEADER_Z_INDEX = 1300;

/** z-index of the modal so it sits above the navbar and sidebar. */
export const APP_MODAL_Z_INDEX = 1400;

/** z-index of menus/dropdowns inside a modal (select, context menu). */
export const APP_MODAL_MENU_Z_INDEX = APP_MODAL_Z_INDEX + 100;

/** z-index of toast/confirmation messages (above nested modals). */
export const APP_TOAST_Z_INDEX = APP_MODAL_MENU_Z_INDEX + 100;

/** Viewport percentage for large centered modals (`fit="large"`). */
export const MODAL_LARGE_VIEWPORT_PERCENT = 95;
