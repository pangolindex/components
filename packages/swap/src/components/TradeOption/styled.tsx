import { Box } from '@honeycomb-finance/core';
import styled from 'styled-components';

export const SwapWrapper = styled(Box)`
  width: 100%;
  /* min-width: 400px; */
  background-color: ${({ theme }) => theme.swapWidget?.backgroundColor};
  position: relative;
  overflow: hidden;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`;
