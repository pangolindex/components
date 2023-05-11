import styled from 'styled-components';
import { Box } from '../Box';

export const Visible = styled(Box)<{
  upToExtraSmall?: boolean;
  upToSmall?: boolean;
  upToMedium?: boolean;
  upToLarge?: boolean;
}>`
  display: none;
  ${({ theme, upToExtraSmall }) =>
    upToExtraSmall &&
    theme.mediaWidth.upToExtraSmall`
    display: block;
  `};

  ${({ theme, upToSmall }) =>
    upToSmall &&
    theme.mediaWidth.upToSmall`
    display: block;
  `};

  ${({ theme, upToMedium }) =>
    upToMedium &&
    theme.mediaWidth.upToMedium`
    display: block;
  `};

  ${({ theme, upToLarge }) =>
    upToLarge &&
    theme.mediaWidth.upToLarge`
    display: block;
  `};
`;
