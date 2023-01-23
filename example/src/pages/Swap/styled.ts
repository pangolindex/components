import styled from 'styled-components';
import { Box } from '@components/index';

export const SwapWidgetWrapper = styled(Box)`
  height: 100%;
  width: 100%;
  min-width: 280px;
  max-width: 400px;
  margin: auto;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: initial;
    margin-right: auto;
    margin-left: auto;
    flex:0;
  `};
`;

export const GridContainer = styled(Box)`
  display: grid;
  grid-template-columns: minmax(auto, 75%) minmax(auto, 25%);
  grid-gap: 12px;
  padding: 10px 0px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: none;
    grid-template-rows: max-content;
  `};
`;
