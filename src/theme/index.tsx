import React, { useContext } from 'react';
import { DefaultTheme, ThemeProvider as StyledComponentsThemeProvider, ThemeContext, css } from 'styled-components';
import { Colors } from './styled';

const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
};

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (acc, sizeKey) => {
    acc[sizeKey] = (a: any, b: any, c: any) => css`
      @media (max-width: ${MEDIA_WIDTHS[sizeKey]}px) {
        ${css(a, b, c)}
      }
    `;
    return acc;
  },
  {},
) as any;

const white = '#FFFFFF';
const black = '#000000';

const philippineYellow = '#FFC800'; //primary
const mustardYellow = '#E1AA00';

const eerieBlack = '#1C1C1C';
const ghostWhite = '#F7F8FA';
const ghostWhite1 = '#FAF9FD';
const chineseBlack = '#111111';
const darkGunmetal = '#212427';
const platinum = '#E5E5E5';
const darkSilver = '#717171';
const venetianRed = '#CC1512';
const oceanBlue = '#18C145';
const quickSilver = '#A3A3A3';

export const defaultColors: Colors = {
  // base
  white,
  black,

  // text
  text1: '#000000',
  text2: '#565A69',
  text3: '#888D9B',
  text4: '#C3C5CB',
  text5: '#EDEEF2',
  text6: '#EDEEF2',
  text7: '#000000',
  text8: '#565A69',
  text9: '#000000',
  text10: '#000000',
  text11: '#18C145',
  text12: '#E84142',
  text13: '#000000',
  text14: '#000000',
  text15: '#000000',

  // backgrounds / greys
  bg1: '#FFFFFF',
  bg2: '#F7F8FA',
  bg3: '#EDEEF2',
  bg4: '#CED0D9',
  bg5: '#888D9B',
  bg6: '#FFFFFF',
  bg7: '#FFFFFF',
  bg8: '#FFFFFF',
  bg9: '#000000',

  //specialty colors
  modalBG: 'rgba(0,0,0,0.3)',
  advancedBG: 'rgba(255,255,255,0.6)',

  //primary colors
  primary1: '#FF6B00',
  primary2: '#FF6B00',
  primary3: '#FF6B00',
  primary4: '#FF6B00',
  primary5: '#FF6B00',
  primary6: '#FFFFFF',

  // color text
  primaryText1: '#ffffff',

  // secondary colors
  secondary1: '#ff007a',
  secondary2: '#F6DDE8',
  secondary3: '#FDEAF1',

  // other
  red1: '#FF6871',
  red2: '#F82D3A',
  green1: '#27AE60',
  yellow1: '#FFE270',
  yellow2: '#F3841E',
  blue1: '#2172E5',

  avaxRed: '#E84142',

  switch: {
    onColor: philippineYellow,
    offColor: '#CED0D9',
    backgroundColor: platinum,
  },

  toggleButton: {
    backgroundColor: platinum,
    selectedColor: ghostWhite,
    fontColor: chineseBlack,
  },

  button: {
    primary: {
      background: philippineYellow,
      color: black,
    },
    secondary: {
      background: chineseBlack,
      color: white,
    },
    outline: {
      borderColor: philippineYellow,
      color: black,
    },
    plain: {
      color: black,
    },
    disable: {
      background: platinum,
      color: darkSilver,
    },
    confirmed: {
      background: oceanBlue,
      color: oceanBlue,
      borderColor: oceanBlue,
    },
  },

  primary: philippineYellow,
  mustardYellow,
  eerieBlack,
  ghostWhite,
  ghostWhite1,
  chineseBlack,
  darkGunmetal,
  platinum,
  darkSilver,
  venetianRed,
  oceanBlue,
  quickSilver,

  color2: ghostWhite,
  color3: platinum,
  color4: chineseBlack,
  color5: white,
  color6: chineseBlack,
  color7: ghostWhite,
  color8: platinum,
  color9: quickSilver,
};

export const defaultTheme: DefaultTheme = {
  ...defaultColors,

  grids: {
    sm: 8,
    md: 12,
    lg: 24,
  },

  //shadows
  shadow1: '#2F80ED',

  // media queries
  mediaWidth: mediaWidthTemplates,

  // css snippets
  flexColumnNoWrap: css`
    display: flex;
    flex-flow: column nowrap;
  `,
  flexRowNoWrap: css`
    display: flex;
    flex-flow: row nowrap;
  `,
};

type ThemeProviderProps = {
  children: React.ReactNode;
  theme: DefaultTheme;
};

export default function ThemeProvider({ children, theme }: ThemeProviderProps) {
  return <StyledComponentsThemeProvider theme={theme || defaultTheme}>{children}</StyledComponentsThemeProvider>;
}

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw Error('useTheme is used outside of ThemeContext');
  }

  return theme;
};
