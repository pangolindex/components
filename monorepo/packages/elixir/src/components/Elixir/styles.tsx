import { Box, Text } from '@honeycomb-finance/core';
import styled from 'styled-components';

export const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;
  padding-bottom: 24px;
  padding-top: 24px;
  white-space: nowrap;
  width: 100%;
`;

export const Link = styled(Text)`
  border: none;
  text-decoration: none;
  background: none;

  cursor: pointer;
  color: ${({ theme }) => theme.white};
  font-weight: 500;

  :hover {
    text-decoration: underline;
  }
`;

export const Content = styled(Box)`
  background-color: ${({ theme }) => theme.color2};
  display: grid;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-rows: max-content auto;
  `};
  width: 100%;
`;

export const GridContainer = styled(Box)`
  display: grid;
  grid-gap: 12px;
  grid-template-columns: 100%;
  height: 100%;
  padding: 50px 0px 0px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 10px 0px 0px;
  `};
`;

export const MobileHeader = styled(Box)`
  align-items: center;
  display: grid;
  flex-direction: row;
  grid-template-columns: max-content max-content;
  justify-content: space-between;
  padding: 10px;
`;

export const PageWrapper = styled(Box)`
  height: calc(100vh - 76px);
  padding-bottom: 10px;
  width: 100%;
`;
