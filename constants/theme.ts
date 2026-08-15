export const colors = {
  primary: '#3157D5',
  primaryDark: '#2546B5',
  accent: '#B7E36A',
  success: '#168A5B',
  danger: '#D64545',
  white: '#FFFFFF',
  neutral900: '#17191C',
  neutral700: '#475467',
  neutral500: '#667085',
  neutral300: '#D0D5DD',
  neutral200: '#E4E7EC',
  neutral100: '#F1F3F5',
  neutral50: '#F8FAFC',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
  giant: 64,
} as const;

export type TypographyToken = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
};

const fontFamily = {
  regular: 'Inter_400Regular',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fontFamily.bold, fontSize: 32, lineHeight: 36 },
  title: { fontFamily: fontFamily.semiBold, fontSize: 20, lineHeight: 28 },
  subtitle: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TypographyToken>;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

const theme = { colors, spacing, typography, radius };

export default theme;
