import styled from 'styled-components';
import { Box } from 'src/components/Box';
import { CloseIcon } from 'src/theme/components';
import Logo from '../Logo';

export const Frame = styled(Box)`
  width: 40vw;
  background-color: ${({ theme }) => theme.color2};
  padding: 15px;
  display: grid;
  grid-auto-flow: row;
  gap: 10px;
  border-radius: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 60vw;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100vw;
  `};
`;

export const Inputs = styled(Box)`
  display: grid;
  grid-auto-flow: column;
  gap: 20px;
`;

export const CloseButton = styled(CloseIcon)`
  color: ${({ theme }) => theme.primary};
  background-color: ${({ theme }) => theme.color5};
  border-radius: 50%;
  padding: 5px;
`;

export const ChainsList = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
`;

export const StyledLogo = styled(Logo)`
  height: 32px;
  width: 32px;
  border-radius: 50%;
  margin-bottom: 10px;
`;
