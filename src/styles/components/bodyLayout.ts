
import { Theme, CSSObject } from '@mui/material/styles';
import { chrome } from '../designTokens';
const   customStyleBody= { 

  bodyContent: (): CSSObject => ({
    display: 'flex'  as const, 
    flexDirection: 'column' as const, 
    minHeight: '100vh'  as const,  
    minWidth: 0,
    width: '100%',
    overflowX: 'hidden',
    background: chrome.canvasBg

    }),
    container : { display: 'flex' as const, flex: 1, minWidth: 0, width: '100%', minHeight: 'calc(100vh - 70px)'  as const, marginTop: '70px' },
    body : { display: 'flex'  as const, flexDirection: 'column' as const, minHeight: '100vh'  as const,  background: chrome.canvasBg},
    mainContent: (theme: Theme, isMobile: boolean, collapsed: boolean): CSSObject => ({
      flexGrow: 1,
      minWidth: 0,
      overflowX: 'hidden',
      backgroundColor: theme.palette.secondary.main,
      //padding: isMobile ?  theme.spacing(4)  :  theme.spacing(15) ,
      paddingLeft :  isMobile ? '20px' : '100px',
      paddingRight:  isMobile ? '20px' : '100px',
      paddingTop:  isMobile ? '20px' : '30px',
      marginLeft: isMobile
        ? 0
        : collapsed
        ? theme.customStyleMenu.menuCollapsed.width
        : theme.customStyleMenu.menu.width,
      transition: 'margin-left 0.3s ease',
    }),
     mainContent2: (theme: Theme, isMobile: boolean, collapsed: boolean): CSSObject => ({
    flexGrow: 1,
    minWidth: 0,
    overflowX: 'hidden',
    backgroundColor: theme.palette.secondary.main,
      padding: theme.spacing(0),
      marginLeft: isMobile
        ? 0
        : collapsed
        ? theme.customStyleMenu.menuCollapsed.width
        : theme.customStyleMenu.menu.width,
      transition: 'margin-left 0.3s ease',
    }),
  }

  export default customStyleBody;
  