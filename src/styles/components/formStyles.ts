import { Theme } from '@mui/material';
import palette from '../palette';
import { colors, fontSizes, fontWeights } from '../designTokens';
import customTextStyles from './textStyles';

const customStyleForm = (theme: Theme) => ({
  inputText: {
    fontSize: '14px'
  },

  titleFormSpacing: {
    marginTop: '15px',
    marginBottom: '0px',
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.bold,
    color: palette.primary.main,
    textAlign: 'left' as const,
    fontFamily: "'Poppins', sans-serif",
  },

  subtitleFormSpacing: {
    marginTop: '24px',
    marginBottom: '24px',
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: '#3f3f3f',
    textAlign: 'left' as const,
    fontFamily: "'Poppins', sans-serif",
  },

  subtitleFormNotSpacing: {
    marginTop: '0px',
    marginBottom: '0px',
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: '#3f3f3f',
    textAlign: 'left' as const,
    fontFamily: "'Poppins', sans-serif",
  },

  fullContainer: {
    width: '100%',
    margin: 'auto',
    padding: '2rem',
    fontFamily: "'Poppins', 'Helvetica', 'Arial', sans-serif",
    display: 'flex' as const,
    background: '#fff',
    marginBottom: '50px',
    flexWrap: 'wrap' as const,
    rowGap: '2rem',
  },

  fullContainer2: {
    position: 'relative' as const,
    width: '100%',
    margin: 'auto',
    padding: '2rem',
    background: '#fff',
    marginBottom: '50px',
     borderRadius: 10,
  },

  fullContainerSteps: {
    position: 'relative' as const,
    width: '100%',
    margin: 'auto',
    padding: '0rem',
    fontFamily: "'Poppins', 'Helvetica', 'Arial', sans-serif",
    background: '#fff',
    marginBottom: '10px',
  },

  fullContainerNotBackground: {
    width: '100%',
    margin: 'auto',
    padding: '0rem',
    fontFamily: "'Poppins', 'Helvetica', 'Arial', sans-serif",
    display: 'flex',
    background: 'transparent',
    marginBottom: '50px',
    flexWrap: 'wrap' as const,
    rowGap: '2rem',
  },

  grid3md: {
    width: '100%',
    textAlign: 'left' as const,
    px: 1,
    flexBasis: '100%',
    maxWidth: '100%',
    [theme.breakpoints.up('md')]: {
      flexBasis: '33.3%',
      maxWidth: '33.3%',
    },
  },

  grid6md: {
    width: '100%',
    textAlign: 'left' as const,
    px: 1,
    flexBasis: '100%',
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    [theme.breakpoints.up('md')]: {
      flexBasis: '50%',
      maxWidth: '50%',
    },
  },

  grid12md: {
    width: '100%',
    textAlign: 'left' as const,
    px: 1,
    flexBasis: '100%',
    maxWidth: '100%',
  },

      inputFieldMUI: {
        '& .MuiOutlinedInput-root': {
      height: '45px',

      '& .MuiOutlinedInput-input': {
        fontSize: '14px',
        padding: '12px 14px 12px', 
      },

      '& fieldset': {
        borderColor: '#ccc',
      },
       '&:hover fieldset': {
        borderColor: '#ccc', 
      },
      '&.Mui-focused fieldset': {
        borderColor: palette.primary.main,
        borderWidth: '2px',
      },
    },

    '& .MuiInputLabel-root': {
      fontSize: '14px',
      top: '-5px',
    },

    '& .MuiInputLabel-shrink': {
      fontSize: '16px',
      top: '0px',
    },
  
  } ,
 
selectFieldMUI: {
  height: 45,
  // Fondo naranja suave en hover
  '&:hover': {
    backgroundColor: colors.brandTint,
  },
  // Borde naranja en hover (para que no oscurezca)
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#cccccc',
  },
  // Borde naranja cuando está enfocado
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: palette.primary.main,
  },
  // Icono naranja
  '& .MuiSelect-icon': {
    color: palette.primary.main,
  },
  mt: 0,
  '&.MuiInputLabel-shrink': {
    mt: 0,
  },
   
  '& .MuiInputLabel-root': {
    fontSize: '12px',
  },
  '& .MuiInputLabel-shrink': {
    fontSize: '10px',
    top: '-6px', 
  },
   '& .MuiSelect-select': {
    fontSize: fontSizes.md,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    paddingRight: '40px',
  },

},



checkboxFieldMUI: {
  display: 'flex',
  flexDirection: 'column' as const,
  height: '45px',
  '& .MuiFormControlLabel-root': {
    margin: 0,
    padding: 0,
    minHeight: '20px',
  },
  '& .MuiCheckbox-root': {
    padding: '4px', // más compacto
  },
  '& .MuiSvgIcon-root': {
    fontSize: '18px', // ícono más pequeño si lo deseas
    color: palette.primary.main,
  },
  '& .MuiCheckbox-root.Mui-checked': {
    color: palette.primary.main,
  },
},

selectFieldMultiMUI: {
  height: 45,
  '&:hover': {
    backgroundColor: colors.brandTint,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#cccccc',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: palette.primary.main,
  },
  '& .MuiSelect-icon': {
    color: palette.primary.main,
  },
  '& .MuiInputLabel-root': {
    fontSize: '12px',
  },
  '& .MuiInputLabel-shrink': {
    fontSize: fontSizes.md,
    top: '0px',
  },
  '& .MuiSelect-select': {
    fontSize: fontSizes.md,
    paddingTop: '10px',
    paddingBottom: '10px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    paddingRight: '40px',
  },
 
},
  
commonTextFieldMUI: {
  '& .MuiOutlinedInput-root': {
    height: '45px',

    '& .MuiOutlinedInput-input': {
      fontSize: '14px',
      padding: '12px 14px',
    },

    '& fieldset': {
      borderColor: '#ccc',
    },
    '&:hover fieldset': {
      borderColor: '#ccc',
    },
    '&.Mui-focused fieldset': {
      borderColor: palette.primary.main,
      borderWidth: '2px',
    },
  },

  '& .MuiInputLabel-root': {
    fontSize: '14px',
    top: '-5px',
  },

  '& .MuiInputLabel-shrink': {
    fontSize: '16px',
    top: '0px',
  },
},
 

uniformFieldHeight: {
   '& .MuiInputBase-root': {
   
    height: '45px',
    boxSizing: 'border-box',
    alignItems: 'center',

    // Si es multiline (ej. TextArea), cambia la alineación y altura
    '&.MuiInputBase-multiline': {
      alignItems: 'flex-start',
      minHeight: '45px',
      height: 'auto',
    },
  },
  '& .MuiSelect-select': {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& .MuiOutlinedInput-input': {
    padding: '10px 14px',
  },
  // El Select también usa .MuiOutlinedInput-input; no pisar el padding-right
  // reservado para el icono del desplegable.
  '& .MuiSelect-select.MuiOutlinedInput-input': {
    paddingRight: '40px',
  },
  '& .MuiFormControl-root': {
    height: '45px',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',

    //  Normal
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#ccc',
      borderWidth: '1px',
    },

    //  Hover
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.primary.main, 
      borderWidth: '2px',
    },

    //  Focus
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.primary.main,
      borderWidth: '2px',
    },

    //  Error
    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.error.main, 
      borderWidth: '2px',
    },
   
    '& .MuiInputLabel-root.Mui-focused': {
      color: customTextStyles.floatingText.color, // color cuando el label flota por focus
    },
    '& .MuiInputLabel-shrink': {
      color:customTextStyles.floatingText.color, // color cuando el label ya flotó por tener texto
    },
  },
    '& .MuiInputLabel-root': {
    color: '#c4bebeff',
    fontWeight: 100,
    transform: 'translate(12px, 13px) scale(1)',

    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -8px) scale(0.75)',
      color: customTextStyles.floatingText.color, // flotante pero no enfocado
    },

    '&.Mui-focused': {
      color: palette.primary.main, // flotante + enfocado
    },

    '&.Mui-error': {
      color: palette.error.main, // flotante con error sin foco
    },

    '&.Mui-focused.Mui-error': {
      color: palette.error.main, // flotante con error y foco
    },
  },
  },

  uniformFieldHeight3: {
  '& .MuiInputBase-root': {
    height: '45px',
    boxSizing: 'border-box',
    alignItems: 'center',
    '&.MuiInputBase-multiline': {
      alignItems: 'flex-start',
      minHeight: '45px',
      height: 'auto',
    },
  },
  '& .MuiSelect-select': {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& .MuiOutlinedInput-input': {
    padding: '10px 14px',
  },
  '& .MuiSelect-select.MuiOutlinedInput-input': {
    paddingRight: '40px',
  },
  '& .MuiFormControl-root': {
    height: '45px',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '0px', // valor por defecto
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#ccc',
      borderWidth: '1px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.primary.main,
      borderWidth: '2px',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.primary.main,
      borderWidth: '2px',
    },
    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.error.main,
      borderWidth: '2px',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: customTextStyles.floatingText.color,
    },
    '& .MuiInputLabel-shrink': {
      color: customTextStyles.floatingText.color,
    },
  },
  '& .MuiInputLabel-root': {
    color: '#c4bebeff',
    fontWeight: 100,
    transform: 'translate(12px, 13px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -8px) scale(0.75)',
      color: customTextStyles.floatingText.color,
    },
    '&.Mui-focused': {
      color: palette.primary.main,
    },
    '&.Mui-error': {
      color: palette.error.main,
    },
    '&.Mui-focused.Mui-error': {
      color: palette.error.main,
    },
  },
},



  radioCheckboxGroup: {
  height: '45px',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'center',
  '& .MuiFormGroup-root': {
    flexDirection: 'row' as const,
    alignItems: 'center',
    marginTop: '2px',
  },
  '& .MuiFormControlLabel-root': {
    marginRight: '12px',
  },
  '& .MuiTypography-root': {
    fontSize: '0.85rem',
  },

  
},

radioCheckboxGroup2: {
 
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'center',
  '& .MuiFormGroup-root': {
    flexDirection: 'row' as const,
    alignItems: 'center',
    marginTop: '2px',
  },
  '& .MuiFormControlLabel-root': {
    marginRight: '12px',
  },
  '& .MuiTypography-root': {
    fontSize: '0.85rem',
  },
}, 

checkboxGroupField: {
 
  
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'center',

  '& .MuiFormGroup-root': {
    flexDirection: 'row' as const,
    alignItems: 'center',
    marginTop: '2px',
  },

  '& .MuiFormControlLabel-root': {
    marginRight: '12px',
  },

  '& .MuiTypography-root': {
    fontSize: '14px',
    color: '#00000099', // texto del label
  },

  

  '& .MuiCheckbox-root': {
    padding: '4px',
    color: '#00000099', // sin seleccionar
    '&.Mui-checked': {
      color: (theme: any) => theme.palette.primary.main, // al seleccionar
    },
  },
},
checkboxField: {
  display: 'flex',
  flexDirection: 'row' as const,
  alignItems: 'center',
  justifyContent: 'flex-start',

  '& .MuiFormControlLabel-root': {
    marginRight: '12px',
    alignItems: 'center',
  },

  '& .MuiTypography-root': {
    fontSize: '14px',
    color: '#00000099', // texto del label
    lineHeight: 1.4,
  },

  '& .MuiCheckbox-root': {
    padding: '4px',
    color: '#00000099', // sin seleccionar
    '&.Mui-checked': {
      color: (theme: any) => theme.palette.primary.main, // al seleccionar
    },
  },
},


  
  uniformTextFieldHeight: {
  '& .MuiInputBase-root': {
    fontSize: '14px',
      minHeight: '45px',
      alignItems: 'flex-start', 
    },
  },

  iconsInputForm: {

      p: 1,
      borderRadius: '8px',
      backgroundColor: 'inherent',
      color: '#cccccc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    
  }
});

export default customStyleForm;
