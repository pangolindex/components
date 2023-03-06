import styled from 'styled-components';
import { Box } from 'src/components';

export const PageWrapper = styled(Box)`
  width: 100%;
  height: calc(100vh - 76px);
  padding-bottom: 10px;
`;

export const GridContainer = styled(Box)`
  display: grid;
  grid-template-columns: 80% 20%;
  grid-gap: 12px;
  padding: 50px 0px 0px;
  height: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 10px 0px 0px;
    grid-template-columns: 100%;
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
