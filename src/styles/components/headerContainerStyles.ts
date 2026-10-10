import { Theme, CSSObject } from "@mui/material/styles";
import { APP_HEADER_Z_INDEX } from "@/shared/layout/appShellConstants";
import { chrome, colors } from "../designTokens";

const customStyleHeader = {
  headerContainer: {
    position: "fixed" as const,
    top: 0,
    left: 325,
    right: 0,
    height: "100px",
    zIndex: APP_HEADER_Z_INDEX,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: chrome.headerBg,
    padding: "16px 24px",
    color: chrome.headerText,
    height: "70px",
    boxShadow: `inset 0 -2px 0 ${colors.brand}`,
  },

  headerContainerCollapsed: (isMobile: boolean): CSSObject => ({
    position: "fixed" as const,
    top: 0,
    left: isMobile ? 0 : 70,
    right: 0,
    height: "100px",
    zIndex: APP_HEADER_Z_INDEX,
  }),

  headerContent: (isMobile: boolean): CSSObject => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: chrome.headerBg,
    padding: isMobile ? "16px 16px" : "16px 24px",
    color: chrome.headerText,
    height: "70px",
    top: 70,
    boxShadow: `inset 0 -2px 0 ${colors.brand}`,
  }),
  navLinks: {
    display: "flex",
    gap: "24px",
    paddingRight: "20PX",
    alignItems: "center",
  },
  navLinkItem: {
    color: chrome.headerMuted,
    textDecoration: "none",
    fontWeight: 500,
    "&:hover": {
      textDecoration: "underline",
    },
  },

  logoBox: (theme: Theme): CSSObject => ({
    position: "fixed",
    top: 16,
    left: 16,
    zIndex: 1301,
    color: chrome.headerText,
    [theme.breakpoints.down("sm")]: {
      marginLeft: "10px",
    },
  }),

  drawerMenuMobile: (theme: Theme): CSSObject => ({
    position: "fixed",
    top: 10,
    left: 8,
    zIndex: 1400,
    color: chrome.headerText,
    fontSize: "2.2rem",
    [theme.breakpoints.up("sm")]: {
      fontSize: "1rem",
    },
  }),

  customLogo: {
    width: 230,
    height: 100,
  },
};

export default customStyleHeader;
