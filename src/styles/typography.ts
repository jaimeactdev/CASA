import { colors, fontSizes, fontWeights } from "./designTokens";

const typography = {
  fontFamily: '"Poppins", Helvetica, Arial, sans-serif',
  fontSize: 14,
  htmlFontSize: 16,
  h1: {
    fontSize: fontSizes.h1,
    fontWeight: fontWeights.bold,
    lineHeight: 1.25,
    color: colors.textPrincipal,
  },
  h2: {
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.semibold,
    lineHeight: 1.3,
    color: colors.textBody,
  },
  h3: { fontSize: fontSizes.h3, fontWeight: fontWeights.semibold, lineHeight: 1.35 },
  h4: { fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, lineHeight: 1.4 },
  h5: { fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, lineHeight: 1.4 },
  h6: { fontSize: fontSizes.md, fontWeight: fontWeights.semibold, lineHeight: 1.4 },
  subtitle1: { fontSize: fontSizes.lg, fontWeight: fontWeights.medium, lineHeight: 1.5 },
  subtitle2: { fontSize: fontSizes.md, fontWeight: fontWeights.medium, lineHeight: 1.5 },
  body1: { fontSize: fontSizes.md, lineHeight: 1.6 },
  body2: { fontSize: fontSizes.sm, lineHeight: 1.55 },
  body3: { fontSize: fontSizes.lg, fontWeight: fontWeights.regular, lineHeight: 1.5 },
  caption: { fontSize: fontSizes.xs, lineHeight: 1.5 },
  button: { fontSize: fontSizes.md, fontWeight: fontWeights.medium },
};

export default typography;
