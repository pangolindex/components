import styled from 'styled-components';
import { PositionProps, SpaceProps, TypographyProps, position, space, typography } from 'styled-system';
import { Colors } from 'src/theme/styled';

export interface TextProps {
  color?: keyof Colors;
  cursor?: string;
}

const Text = styled.div<TextProps & TypographyProps & SpaceProps & PositionProps>`
  ${space}
  ${typography}
  ${position}
  color: ${({ color, theme }) => color && theme[color]};
  cursor: ${(props) => props.cursor && props.cursor};
`;
export default Text;
