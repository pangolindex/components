import styled from 'styled-components';
import { Box } from 'src/components';

export const ClaimWrapper = styled(Box)`
  width: 100%;
  height: 100%;
`;
export const Root = styled(Box)`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0px 10px;
`;

export const RewardWrapper = styled(Box)`
  display: grid;
  grid-template-columns: minmax(auto, 50%);
  grid-gap: 8px;
  justify-content: center;
`;

export const StatWrapper = styled(Box)`
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ErrorWrapper = styled(Box)`
  // display: grid;
  // grid-template-rows: minmax(100px, auto) max-content;
  height: 100%;
  padding: 10px;
`;

export const ErrorBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
