import styled from 'styled-components';
import { Box, Text } from 'src/components';

export const Buttons = styled(Box)`
  width: 100%;
  display: grid;
  grid-template-columns: 0.5fr 0.5fr;
  grid-gap: 5px;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    flex-direction: column;
  `};
`;

export const ErrorBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const Link = styled(Text)`
  cursor: pointer;
`;
