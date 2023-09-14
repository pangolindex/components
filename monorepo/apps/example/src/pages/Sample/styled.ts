import { Box } from '@honeycomb-finance/core';
import styled from 'styled-components';

export const GridContainer = styled(Box)`
  display: grid;
  grid-template-columns: minmax(auto, 75%) minmax(auto, 25%);
  grid-gap: 12px;
  padding: 10px 0px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: none;
    grid-template-rows: max-content;
  `};
  height: 600px;
`;

export const PortfolioContainer = styled(GridContainer)`
  grid-template-columns: 1fr 1fr;
  height: 400px;
`;
