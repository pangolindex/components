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

export const RewardWrapper = styled(Box)<{ isSuperFarm?: boolean }>`
  display: grid;
  grid-template-columns: ${({ isSuperFarm }) =>
    isSuperFarm ? 'minmax(auto, 50%) minmax(auto, 50%)' : 'minmax(auto, 100%)'};
  grid-gap: 8px;
  justify-content: center;
`;

export const ErrorWrapper = styled(Box)`
  display: grid;
  grid-template-rows: auto max-content;
  height: 100%;
`;

export const ErrorBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const Buttons = styled(Box)`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 1fr 1fr;
  margin-top: 10px;
  margin-bottom: 10px;
`;
