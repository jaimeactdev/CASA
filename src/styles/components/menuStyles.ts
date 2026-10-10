import { Theme, CSSObject } from "@mui/material/styles";
import { chrome, colors, fontSizes, fontWeights } from "../designTokens";

const customStyleMenu = {
  menuMobile: {
    width: 300,
    bgcolor: chrome.sidebarBg,
    height: "100dvh",
    minHeight: "100dvh",
    maxHeight: "100dvh",
    top: 0,
    bottom: 0,
    borderRadius: 0,
    overflowY: "auto" as const,
  },
  menu: { backgroundColor: chrome.sidebarBg, width: "325px" },
  menuCollapsed: { width: "70px", BorderRight: "0px solid black" },
  levelOneMenu: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: chrome.sidebarText,
  },
  iconMenu: { color: chrome.sidebarMuted },
  iconMenuActive: { color: colors.brand },
  levelTwoMenu: {
    color: chrome.sidebarMuted,
    backgroundColor: "transparent",
  },
  levelTwoMenuActive: {
    color: colors.brand,
    backgroundColor: chrome.sidebarActiveBg,
  },
  levelTwoTextMenu: { color: chrome.sidebarMuted, fontSize: fontSizes.md },
  levelTwoTextMenuActive: {
    color: colors.brand,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  levelTwoMenuHover: {
    color: colors.brand,
    backgroundColor: `${colors.brandTint} !important`,
  },
  slidebarBoxStyles: (theme: Theme, collapsed: boolean): CSSObject => ({
    position: "fixed",
    top: "0px",
    left: 0,
    width: collapsed
      ? theme.customStyleMenu.menuCollapsed.width
      : theme.customStyleMenu.menu.width,
    height: "calc(100vh)",
    overflowY: "auto",
    overflowX: "hidden",
    zIndex: 1100,
  }),
};

export default customStyleMenu;
