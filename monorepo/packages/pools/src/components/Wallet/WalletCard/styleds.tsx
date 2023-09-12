import { Box, Button } from '@honeycomb/core';
import styled from 'styled-components';

export const Panel = styled(Box)`
  background-color: ${({ theme }) => theme.bg8};
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 20px;
  border-radius: 10px;
  height: 295px;
  * {
    box-sizing: border-box;
  }
`;

export const Divider = styled(Box)`
  height: 1px;
  background-color: ${({ theme }) => theme.bg7};
  margin: 10px 0px 10px 0px;
  width: 100%;
`;

export const ActionButon = styled(Button)`
  width: 100%;
`;

export const DetailButton = styled(ActionButon)`
  border: 1px solid !important;
  border-color: ${({ theme }) => theme.text10}!important;
`;
export const StatWrapper = styled(Box)`
  display: grid;
  grid-template-columns: minmax(auto, 50%) minmax(auto, 50%);
  grid-gap: 12px;
  margin-top: 10px;
  flex: 1;
  height: 100%;
  align-items: center;
`;

export const InnerWrapper = styled(Box)`
  display: grid;
  grid-template-columns: minmax(auto, 50%) minmax(auto, 50%);
  grid-gap: 12px;
  margin-top: 10px;
`;
