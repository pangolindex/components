import { Box } from '@pangolindex/core';
import styled from 'styled-components';

export const AddWrapper = styled(Box)`
  width: 100%;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
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

export const StyledBalanceMax = styled.button`
  height: 28px;
  background-color: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 0.5rem;
  font-size: 0.875rem;

  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.text8};

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
`;
export const InputWrapper = styled(Box)`
  display: grid;
  grid-auto-flow: 'row';
  grid-auto-columns: minmax(0, 1fr);
  grid-gap: 5px;
`;

export const InformationBar = styled(Box)`
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg6};
  margin-top: 12px;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 4px;
`;
export const GridContainer = styled(Box)`
  display: grid;
  grid-template-columns: minmax(auto, 33%) minmax(auto, 33%) minmax(auto, 33%);
  grid-gap: 8px;
`;

export const ButtonWrapper = styled(Box)`
  justify-content: space-between;
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
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
