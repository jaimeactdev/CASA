import { CSSObject } from '@mui/material/styles';
import { colors } from '../designTokens';

const {
  brand,
  brandPress,
  brandHover,
  brandDisabled,
  brandBg,
  textBody,
  surface2,
  surface3,
} = colors;

const iconStyles: CSSObject = {
  '& .MuiButton-startIcon, & .MuiButton-endIcon': {
    margin: 0,
    '& > *:nth-of-type(1)': {
      fontSize: '18px',
    },
  },
};

const disabledStyles: CSSObject = {
  '&.Mui-disabled': {
    backgroundColor: brandDisabled,
    color: surface3,
    borderColor: brandDisabled,
    cursor: 'not-allowed',
    pointerEvents: 'none',
    transform: 'none',
    '& .MuiButton-startIcon, & .MuiButton-endIcon': {
      color: surface3,
    },
  },
};

/** Shared base styles (.btn) — 44px pill, Roboto Medium 14px */
const base: CSSObject = {
  fontFamily: "'Roboto', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  height: '44px',
  minHeight: '44px',
  padding: '0 24px',
  borderRadius: '9999px',
  textTransform: 'none',
  boxShadow: 'none',
  gap: '8px',
  lineHeight: 1,
  transition: 'all 0.12s',
  '&:hover': {
    boxShadow: 'none',
  },
  '&:focus': {
    boxShadow: 'none',
  },
  ...iconStyles,
};

const primary: CSSObject = {
  ...base,
  backgroundColor: brand,
  color: '#fff',
  border: 'none',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: brandHover,
    color: '#fff',
    boxShadow: 'none',
    '& .MuiButton-startIcon, & .MuiButton-endIcon': {
      color: '#fff',
    },
  },
  '&:active': {
    backgroundColor: brandPress,
    transform: 'scale(0.97)',
    boxShadow: 'none',
  },
  '& .MuiButton-startIcon, & .MuiButton-endIcon': {
    color: '#fff',
  },
  ...disabledStyles,
};

const secondary: CSSObject = {
  ...base,
  backgroundColor: 'transparent',
  color: brand,
  border: `1.5px solid ${brand}`,
  '&:hover': {
    backgroundColor: brandBg,
    color: brand,
    borderColor: brand,
    boxShadow: 'none',
    '& .MuiButton-startIcon, & .MuiButton-endIcon': {
      color: brand,
    },
  },
  '&:active': {
    backgroundColor: brandBg,
    transform: 'scale(0.97)',
    boxShadow: 'none',
  },
  '& .MuiButton-startIcon, & .MuiButton-endIcon': {
    color: brand,
  },
  ...disabledStyles,
};

const ghost: CSSObject = {
  ...base,
  backgroundColor: 'transparent',
  color: textBody,
  border: `1.5px solid ${textBody}`,
  '&:hover': {
    backgroundColor: surface2,
    color: textBody,
    borderColor: textBody,
    boxShadow: 'none',
    '& .MuiButton-startIcon, & .MuiButton-endIcon': {
      color: textBody,
    },
  },
  '&:active': {
    backgroundColor: surface2,
    transform: 'scale(0.97)',
    boxShadow: 'none',
  },
  '& .MuiButton-startIcon, & .MuiButton-endIcon': {
    color: textBody,
  },
  ...disabledStyles,
};

const sm: CSSObject = {
  height: '36px',
  minHeight: '36px',
  padding: '0 16px',
  fontSize: '12px',
};

const lg: CSSObject = {
  height: '52px',
  minHeight: '52px',
  padding: '0 32px',
  fontSize: '16px',
};

const withRippleHover: CSSObject = {
  ...primary,
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 'var(--x)',
    top: 'var(--y)',
    width: 'var(--size)',
    height: 'var(--size)',
    background: `radial-gradient(circle closest-side, ${brandHover}, transparent)`,
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.2s ease, height 0.2s ease',
    zIndex: 0,
    pointerEvents: 'none',
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
};

const customButtons = {
  base,
  primary,
  secondary,
  ghost,
  sm,
  lg,
  /** @deprecated Usar `secondary` — alias por compatibilidad */
  orange: secondary,
  /** @deprecated Usar `primary` — alias por compatibilidad */
  buttonContent: primary,
  withRippleHover,
};

export default customButtons;
