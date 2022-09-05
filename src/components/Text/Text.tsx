import get from 'lodash.get';
import styled from 'styled-components';
import { PositionProps, SpaceProps, TypographyProps, position, space, typography } from 'styled-system';
import { ThemeColorsType } from 'src/theme';

export interface TextProps {
  color?: ThemeColorsType;
  cursor?: string;
}

const Text = styled.div<TextProps & TypographyProps & SpaceProps & PositionProps>`
  ${space}
  ${typography}
  ${position}
  color: ${({ color, theme }) => color && (get(theme, color, color) as string)};
  cursor: ${(props) => props.cursor && props.cursor};
`;
export default Text;
