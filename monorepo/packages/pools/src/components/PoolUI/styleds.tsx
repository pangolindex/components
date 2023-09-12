import { Box } from '@honeycomb/core';
import styled from 'styled-components';

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
    grid-template-columns: 100%;
  `};
`;
