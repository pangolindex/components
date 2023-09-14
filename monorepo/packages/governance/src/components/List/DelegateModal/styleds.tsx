import { AutoColumn, Box } from '@honeycomb-finance/core';
import styled from 'styled-components';

export const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 24px;
`;

export const TextButton = styled.div`
  :hover {
    cursor: pointer;
  }
`;

export const Wrapper = styled(Box)`
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
  justify-content: space-between;
`;

export const DelegateModalWrapper = styled.div`
  width: 100%;
  overflow: auto;
  border-radius: 10px;
  padding: 24px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`;
