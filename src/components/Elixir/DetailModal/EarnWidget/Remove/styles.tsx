import styled from 'styled-components';
import { Box } from 'src/components';

export const RemoveWrapper = styled(Box)`
  width: 100%;
  padding: 0px 10px 10px 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  * {
    box-sizing: border-box;
  }
`;

export const RemoveLiquidityWrapper = styled(Box)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const ButtonWrapper = styled(Box)`
  justify-content: space-between;
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
`;
