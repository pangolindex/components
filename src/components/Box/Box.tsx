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
import { Colors } from 'src/theme/styled';

export interface Props {
  color?: keyof Colors;
  bgColor?: keyof Colors;
}

export type BoxProps = SpaceProps & LayoutProps & FlexboxProps & TypographyProps & BorderProps & PositionProps;
//TODO: set appropriate type
const Box = styled.div<BoxProps & Props>`
  color: ${({ color, theme }) => (color ? (theme[color] as string) : 'black')};
  background-color: ${({ bgColor, theme }) => (bgColor ? (theme[bgColor] as string) : 'transparent')};
  ${space}
  ${layout}
  ${flexbox}
  ${typography}
  ${border}
  ${position}
`;
export default Box;
