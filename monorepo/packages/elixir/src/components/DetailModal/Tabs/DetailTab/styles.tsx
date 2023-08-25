import { Box } from '@pangolindex/core';
import styled from 'styled-components';

export const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  padding: 30px;
`;

export const NFT = styled.img`
  max-width: 210px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
   max-width: 100%;
   width: 100%;
  `};
`;

export const PriceCards = styled(Box)`
  gap: 30px;
  display: flex;
  margin-bottom: 30px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `};
`;

export const PriceDetailAndNft = styled.div`
  display: flex;
  flex-direction: row;
  gap: 30px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: space-around;
  `};
`;

export const Information = styled(Box)`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
`;

export const StateContainer = styled.div<{ colNumber: number }>`
  grid-template-columns: repeat(${({ colNumber }) => colNumber}, auto);
  gap: 12px;
  display: grid;
  width: 100%;
  align-items: start;
  margin-top: 12px;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  ${({ theme, colNumber }) => theme.mediaWidth.upToSmall`
    grid-template-columns: repeat(${colNumber}, minmax(100px, 1fr));
    grid-column-gap: 6px;
    grid-row-gap:6px;
  `};
`;
