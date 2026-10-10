import { chrome, colors } from "./designTokens";

const palette = {
  primary: {
    main: colors.brand,
    dark: colors.brandPress,
    light: colors.brandBg,
    contrastText: colors.textPositive,
  },
  background: {
    paper: colors.surface0,
    default: chrome.canvasBg,
  },
  secondary: {
    main: chrome.canvasBg,
  },
  text: {
    primary: colors.textBody,
    secondary: colors.textSecondary,
  },
  divider: chrome.sidebarBorder,
  error: {
    main: "#F60041",
  },
};

export default palette;
