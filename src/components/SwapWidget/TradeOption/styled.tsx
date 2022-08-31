import styled from 'styled-components';
import { Box } from '../../';

export const SwapWrapper = styled(Box)`
  width: 100%;
  /* min-width: 400px; */
  background-color: ${({ theme }) => theme.swapWidget?.backgroundColor};
  position: relative;
  overflow: hidden;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`;
