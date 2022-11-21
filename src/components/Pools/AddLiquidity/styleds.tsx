import styled from 'styled-components';
import { Box } from 'src/components';
import { SpaceType } from 'src/state/pstake/types';

export const AddWrapper = styled(Box)`
  width: 100%;
  padding-right: 20px;
  padding-left: 20px;
  padding-bottom: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const StyledBalanceMax = styled.button`
  height: 28px;
  background-color: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 0.5rem;
  font-size: 0.875rem;

  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.text2};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`;
export const ArrowWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg6};
  width: 30px;
  height: 30px;
  border-radius: 50%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
`;
export const LightCard = styled(Box)`
  width: 100%;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.bg6};
  margin-top: 10px;
  padding: 10px;
`;
export const InputWrapper = styled(Box)<{ type: string }>`
  display: grid;
  grid-auto-flow: ${({ type }) => (type === SpaceType.detail ? 'row' : 'column')};
  grid-auto-columns: minmax(0, 1fr);
  grid-gap: 5px;
`;
export const Buttons = styled(Box)`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  grid-gap: 10px;
  margin-top: 10px;
`;

export const ButtonWrapper = styled(Box)`
  justify-content: space-between;
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
`;
