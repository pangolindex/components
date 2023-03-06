import styled from 'styled-components';
import { Box, Text } from 'src/components';

export const Card = styled.div`
  background-color: ${({ theme }) => theme.concentratedLiquidity?.primaryBgColor};
  border-radius: 10px;
  padding: 32px;
  display: flex;
  flex-direction: row;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: space-between;
    width: max-content;
  `};
`;

export const Row = styled(Box)`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

export const BlackBox = styled(Box)`
  background-color: ${({ theme }) => theme.concentratedLiquidity?.secondaryBgColor};
  border-radius: 7px;
  display: flex;
  flex-direction: row;
`;

export const BlackBoxContent = styled(Text)`
  padding: 0.1rem 1rem;
`;

export const Data = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding-right: 30px;
`;

export const Price = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
