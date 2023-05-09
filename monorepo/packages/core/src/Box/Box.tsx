import get from 'lodash.get';
import styled from 'styled-components';
import {
  BorderProps,
  FlexboxProps,
  LayoutProps,
  PositionProps,
  SpaceProps,
  TypographyProps,
  border,
  flexbox,
  layout,
  position,
  space,
  typography,
} from 'styled-system';
import { ThemeColorsType } from '@pangolindex/theme';

export interface Props {
  color?: ThemeColorsType;
  bgColor?: ThemeColorsType;
}

export type BoxProps = SpaceProps & LayoutProps & FlexboxProps & TypographyProps & BorderProps & PositionProps;

const Box = styled.div<BoxProps & Props>`
  color: ${({ color, theme }) => color && get(theme, color, color)};
  background-color: ${({ bgColor, theme }) => (bgColor ? (get(theme, bgColor) as string) : 'transparent')};
  ${space}
  ${layout}
  ${flexbox}
  ${typography}
  ${border}
  ${position}
`;
export default Box;
