import styled from 'styled-components';
import { Box } from '../../';

export const SwapRouteWrapper = styled(Box)`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  margin: 0px auto;
  background-color: ${({ theme }) => theme.swapWidget?.backgroundColor};
  padding: 10px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  justify-content: center;
`;
