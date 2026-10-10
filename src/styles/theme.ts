
import { createTheme } from '@mui/material/styles';
import palette from './palette';
import typography  from './typography';
import customButtons  from './components/buttonStyles'; 
import customStyleMenu  from './components/menuStyles';
import customStyleBody from './components/bodyLayout';
import customTextStyles from './components/textStyles';
import customStyleHeader from './components/headerContainerStyles';
import customStyleForm from './components/formStyles';


const baseTheme  = createTheme({
  

  palette,
  typography,
  customButtons,
  customStyleMenu,
  customTextStyles,
  customStyleBody,
  customStyleHeader,
  
 
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          ...customButtons.base,
          '&:hover': {
            boxShadow: 'none',
          },
          '&:active': {
            boxShadow: 'none',
          },
          '&:focus': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          minWidth: 0,
          maxWidth: '100%',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minWidth: 0,
          maxWidth: '100%',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          minWidth: 0,
          maxWidth: '100%',
        },
        select: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
          maxWidth: '100%',
          boxSizing: 'border-box',
          // Espacio para el icono del desplegable; evita que el valor lo tape.
          paddingRight: '40px !important',
        },
        icon: {
          flexShrink: 0,
          right: 7,
        },
      },
    },
  },
  
});

const theme = createTheme({
  ...baseTheme,
  customStyleForm: customStyleForm(baseTheme),
});






export default theme;
