import styled from 'styled-components';
import { Box } from '@components/index';

export const SwapWidgetWrapper = styled(Box)`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
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
