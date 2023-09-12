import { Box } from '@honeycomb/core';
import styled from 'styled-components';

export const CompoundWrapper = styled(Box)`
  width: 100%;
  height: 100%;
`;
export const Root = styled(Box)`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0px 10px 10px 10px !important;
`;

export const RewardWrapper = styled(Box)`
  display: grid;
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
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  grid-gap: 10px;
  align-self: end;
`;

export const WarningMessageWrapper = styled(Box)`
  display: grid;
  grid-template-columns: auto 16px;
  grid-gap: 10px;
  padding: 10px;
  background-color: ${({ theme }) => theme.color3};
  border-radius: 8px;
  width: 100%;
  align-items: center;
`;
