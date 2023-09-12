import { Box } from '@honeycomb/core';
import styled from 'styled-components';

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

export const ButtonWrapper = styled(Box)`
  justify-content: space-between;
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
`;

export const BlackWrapper = styled(Box)`
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  padding: 20px 30px;
  flex-direction: column;
  z-index: 999;
  position: absolute;
  align-items: center;
  pointer-events: all;
  justify-content: center;
  right: 0;
  top: 0;
  background-color: ${({ theme }) => theme.bg2};
`;

export const ErrorWrapper = styled(Box)`
  display: grid;
  grid-template-rows: minmax(100px, auto) max-content;
  height: 100%;
  padding: 10px;
`;

export const ErrorBox = styled(Box)`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
