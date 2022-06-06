import { X } from 'react-feather';
import styled from 'styled-components';
import { Box } from 'src/components';

export const Hidden = styled(Box)<{
  upToExtraSmall?: boolean;
  upToSmall?: boolean;
  upToMedium?: boolean;
  upToLarge?: boolean;
}>`
  ${({ theme, upToExtraSmall }) =>
    upToExtraSmall &&
    theme.mediaWidth.upToExtraSmall`
      display: none;
    `};

  ${({ theme, upToSmall }) =>
    upToSmall &&
    theme.mediaWidth.upToSmall`
      display: none;
    `};

  ${({ theme, upToMedium }) =>
    upToMedium &&
    theme.mediaWidth.upToMedium`
      display: none;
    `};

  ${({ theme, upToLarge }) =>
    upToLarge &&
    theme.mediaWidth.upToLarge`
      display: none;
    `};
`;

export const CloseIcon = styled(X)<{ onClick: () => void }>`
  cursor: pointer;
`;
