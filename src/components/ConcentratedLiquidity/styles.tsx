import styled from 'styled-components';
import { Box } from 'src/components';

export const PageWrapper = styled(Box)`
  width: 100%;
  height: calc(100vh - 76px);
  padding-bottom: 10px;
`;

export const GridContainer = styled(Box)`
  display: grid;
  grid-template-columns: 100%;
  grid-gap: 12px;
  padding: 50px 0px 0px;
  height: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 10px 0px 0px;
  `};
`;

export const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding-top: 24px;
  padding-bottom: 24px;
  overflow-y: auto;
  white-space: nowrap;
  width: 100%;
`;

export const MobileHeader = styled(Box)`
  display: grid;
  flex-direction: row;
  padding: 10px;
  grid-template-columns: max-content max-content;
  justify-content: space-between;
  align-items: center;
`;

export const Content = styled(Box)`
  display: grid;
  width: 100%;
  background-color: ${({ theme }) => theme.color8};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-rows: max-content auto;
  `};
`;
