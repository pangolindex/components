import styled from 'styled-components';
import { Box } from 'src/components';

export const Wrapper = styled(Box)`
  display: flex;
  background-color: ${({ theme }) => theme?.concentratedLiquidity?.primaryBgColor};
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: space-between;
    width: max-content;
  `};
`;

export const PriceSection = styled(Box)`
  display: flex;
  gap: 20px;
`;

export const BlackBox = styled(Box)`
  background-color: ${({ theme }) => theme.concentratedLiquidity?.secondaryBgColor};
  border-radius: 7px;
  display: flex;
  cursor: pointer;
  padding: 5px;
  flex-direction: row;
  &:hover {
    background-color: ${({ theme }) => theme?.primary};
  }
`;
