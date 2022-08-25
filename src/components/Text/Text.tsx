import styled from 'styled-components';
import { PositionProps, SpaceProps, TypographyProps, position, space, typography } from 'styled-system';
import { Colors } from 'src/theme/styled';

export enum TextType {
  inputText = 'inputText',
  labelText = 'labelText',
  placeholderText = 'placeholderText',
  detailsText = 'detailsText',
}

export interface TextProps {
  color?: keyof Colors;
  type?: TextType;
  cursor?: string;
}

const Text = styled.div<TextProps & TypographyProps & SpaceProps & PositionProps>`
  ${space}
  ${typography}
  ${position}
  color: ${({ color, type, theme }) =>
    color && (type ? theme[color]?.[type] : theme[color]?.['text'] ?? (theme[color] as string))};
  cursor: ${(props) => props.cursor && props.cursor};
`;
export default Text;
