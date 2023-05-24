import { X } from 'react-feather';
import styled, { keyframes } from 'styled-components';
import { Box } from 'src/components';
import { AutoColumn, ColumnCenter } from 'src/components/Column';

export const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 24px;
`;

export const StyledClosed = styled(X)`
  :hover {
    cursor: pointer;
  }
`;

export const ConfirmOrLoadingWrapper = styled.div`
  width: 100%;
  padding: 24px;
`;

export const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.img`
  animation: 2s ${rotate} linear infinite;
  width: 16px;
  height: 16px;
`;

export const CustomLightSpinner = styled(Spinner)<{ size: string }>`
  height: ${({ size }) => size};
  width: ${({ size }) => size};
`;

export const Wrapper = styled(Box)`
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
  justify-content: space-between;
`;
