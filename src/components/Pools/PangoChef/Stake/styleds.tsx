import styled from 'styled-components';
import { Box, Text, TextInput } from 'src/components';
import { SpaceType } from 'src/state/pstake/types';

export const StakeWrapper = styled(Box)`
  width: 100%;
  padding: 0px 10px 10px 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  * {
    box-sizing: border-box;
  }
`;

export const InputText = styled(TextInput)`
  background-color: ${({ theme }) => theme.color10};
  padding: 15px;
  align-items: center;
  border-radius: 4px;
`;

export const ContentBox = styled(Box)`
  width: 100%;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.color10};
  margin-top: 10px;
  padding: 10px;
`;

export const DataBox = styled(Box)`
  align-items: center;
  justify-content: space-between;
  display: flex;
  margin: 5px 0px 5px 0px;
`;

export const ExtraRewardDataBox = styled(Box)`
  justify-content: space-between;
  display: flex;
  margin: 5px 0px 5px 0px;
`;
export const PoolSelectWrapper = styled(Box)`
  width: 100%;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid transparent;
  display: flex;
  position: relative;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.color10};
  color: ${({ theme }) => theme.text4};
  cursor: pointer;
`;

export const InputWrapper = styled(Box)<{ type: string }>`
  display: grid;
  grid-auto-flow: ${({ type }) => (type === SpaceType.detail ? 'row' : 'column')};
  grid-auto-columns: minmax(0, 1fr);
  margin-top: ${({ type }) => (type === SpaceType.detail ? '10px' : '0px')};
  grid-gap: 5px;
  align-items: ${({ type }) => (type === SpaceType.detail ? 'normal' : 'center')};
`;
export const Buttons = styled(Box)`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  grid-gap: 10px;
  margin-top: 10px;
`;
export const CardContentBox = styled(Box)<{ isSuperFarm: boolean }>`
  width: 100%;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.color10};
  margin-top: 10px;
  padding: 10px;
  display: grid;
  grid-template-columns: ${({ isSuperFarm }) =>
    isSuperFarm ? 'minmax(auto, 50%) minmax(auto, 50%)' : 'minmax(auto, 33%) minmax(auto, 33%) minmax(auto, 33%)'};
  grid-gap: 10px;
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

export const SubmittedWrapper = styled(Box)`
  display: grid;
  grid-template-rows: auto max-content;
  height: 100%;
`;

export const ContentWrapper = styled(Box)`
  display: grid;
  grid-gap: 20px;
  padding: 20px;
  height: 100%;
`;

export const Link = styled(Text)`
  text-decoration: none;
  color: ${({ theme }) => theme.blue1};
`;
