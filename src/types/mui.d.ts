// mui.d.ts
import { CSSObject } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    customButtons: {
      base: CSSObject;
      primary: CSSObject;
      secondary: CSSObject;
      ghost: CSSObject;
      sm: CSSObject;
      lg: CSSObject;
      orange: CSSObject;
      buttonContent: CSSObject;
      withRippleHover: CSSObject;
    };
    customStyleMenu: {
      menuMobile: CSSObject;
      menu: {
        width: string | number;
        backgroundColor: string;
      };
      menuCollapsed: {
        width: string | number;
      };
      levelOneMenu: CSSObject;
      iconMenu: CSSObject;
      iconMenuActive: CSSObject;
      levelTwoMenu: CSSObject;
      levelTwoMenuActive: CSSObject;
      levelTwoTextMenu: CSSObject;
      levelTwoTextMenuActive: CSSObject;
      levelTwoMenuHover: CSSObject;
      slidebarBoxStyles: (theme: Theme, collapsed: boolean) => CSSObject;
    };
    customTextStyles: {
      tituloPrincipal: { fontSize: string; fontWeight: number; color: string };
      tituloSecundario: { fontSize: string; fontWeight: number; color: string };
      textoGeneral: { fontSize: string; fontWeight: number; color: string };
      floatingText: { color: string };
    };
    customStyleBody: {
      container: CSSObject;
      body: CSSObject;
      bodyContent: ( isMobile: boolean) => CSSObject;
      mainContent: (theme: Theme, isMobile: boolean, collapsed: boolean) => CSSObject;
      mainContent2: (theme: Theme, isMobile: boolean, collapsed: boolean) => CSSObject;
    };
    customStyleHeader: {
      headerContainer: CSSObject;
     headerContainerCollapsed : ( isMobile: boolean) => CSSObject;
      header: CSSObject;
      headerContent:  (isMobile: boolean) => CSSObject;
      navLinks: CSSObject;
      navLinkItem: CSSObject;
      customLogo: {
        width: number;
        height: number;
      };
      logoBox: (theme: Theme) => CSSObject;
      drawerMenuMobile: (theme: Theme) => CSSObject;
    };
    customStyleForm: {
      inputText: CSSObject;
      titleFormSpacing: CSSObject;
      subtitleFormSpacing: CSSObject;
      subtitleFormNotSpacing: CSSObject;
      fullContainer: CSSObject;
      fullContainer2: CSSObject;
      fullContainerSteps: CSSObject;
      fullContainerNotBackground: CSSObject;
      grid3md: CSSObject;
      grid6md: CSSObject;
      grid12md: CSSObject;
      inputFieldMUI: CSSObject;
      selectFieldMUI: CSSObject;
      checkboxFieldMUI: CSSObject;
      selectFieldMultiMUI: CSSObject;
      commonTextFieldMUI: CSSObject;
      uniformFieldHeight: CSSObject;
      radioCheckboxGroup: CSSObject;
      radioCheckboxGroup2: CSSObject;
      uniformTextFieldHeight: CSSObject;
      iconsInputForm: CSSObject;
      checkboxGroupField: CSSObject;
      checkboxField: CSSObject;
    };
  }

  interface ThemeOptions {
    customButtons?: {
      base?: CSSObject;
      primary?: CSSObject;
      secondary?: CSSObject;
      ghost?: CSSObject;
      sm?: CSSObject;
      lg?: CSSObject;
      orange?: CSSObject;
      buttonContent?: CSSObject;
      withRippleHover?: CSSObject;
    };
    customStyleMenu?: {
      menuMobile?: CSSObject;
      menu?: {
        width?: string | number;
        backgroundColor?: string;
      };
      menuCollapsed?: {
        width?: string | number;
      };
      levelOneMenu?: CSSObject;
      iconMenu?: CSSObject;
      iconMenuActive?: CSSObject;
      levelTwoMenu?: CSSObject;
      levelTwoMenuActive?:CSSObject;
      levelTwoTextMenu?: CSSObject;
      levelTwoTextMenuActive?:CSSObject;
      levelTwoMenuHover?: CSSObject;
      slidebarBoxStyles?: (theme: Theme, collapsed: boolean) => CSSObject;
    };
    customTextStyles?: {
      tituloPrincipal?: { fontSize?: string; fontWeight?: number; color?: string };
      tituloSecundario?: { fontSize?: string; fontWeight?: number; color?: string };
      textoGeneral?: { fontSize?: string; fontWeight?: number; color?: string };
      floatingText?: { color?: string };
    };
    customStyleBody?: {
      container?: CSSObject;
      body?: CSSObject;
      bodyContent?: (isMobile: boolean) => CSSObject;
      mainContent?: (theme: Theme, isMobile: boolean, collapsed: boolean) => CSSObject;
      mainContent2?: (theme: Theme, isMobile: boolean, collapsed: boolean) => CSSObject;
    };
    customStyleHeader?: {
      headerContainer?: CSSObject;
      headerContainerCollapsed? : (isMobile: boolean) => CSSObject;
      header?: CSSObject;
     headerContent?:  (isMobile: boolean) => CSSObject;
      navLinks?: CSSObject;
      navLinkItem?: CSSObject;
      customLogo?: {
        width?: number;
        height?: number;
      };
      logoBox?: (theme: Theme) => CSSObject;
      drawerMenuMobile?: (theme: Theme) => CSSObject;
    };
    customStyleForm?: {
      inputText?: CSSObject;
      titleFormSpacing?: CSSObject;
      subtitleFormSpacing?: CSSObject;
      subtitleFormNotSpacing?: CSSObject;
      fullContainer?: CSSObject;
      fullContainer2?: CSSObject;
      fullContainerSteps?: CSSObject;
      fullContainerNotBackground?: CSSObject;
      grid3md?: CSSObject;
      grid6md?: CSSObject;
      grid12md?: CSSObject;
      inputFieldMUI?: CSSObject;
      selectFieldMUI?: CSSObject;
      checkboxFieldMUI?: CSSObject;
      selectFieldMultiMUI?: CSSObject;
      commonTextFieldMUI?: CSSObject;
      uniformFieldHeight?: CSSObject;
      radioCheckboxGroup?: CSSObject;
      radioCheckboxGroup2?: CSSObject;
      uniformTextFieldHeight?: CSSObject;
      iconsInputForm?: CSSObject;
      checkboxGroupField?: CSSObject;
      checkboxField?: CSSObject;
    };
  }
}
