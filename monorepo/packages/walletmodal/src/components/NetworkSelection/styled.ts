import { Box, Logo } from '@honeycomb-finance/core';
import styled from 'styled-components';

export const Frame = styled(Box)`
  width: 40vw;
  max-height: 95vh;
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

export const Wrapper = styled(Box)`
  max-height: 500px;
`;

export const Item = styled(Box)`
  background-color: ${({ theme }) => theme.color10};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 120px;
  cursor: pointer;
  padding: 10px;
`;
