import { AutoColumn, Box, ColumnCenter } from '@honeycomb-finance/core';
import { GovernanceType } from '@pangolindex/sdk';
import styled from 'styled-components';

export const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`;

export const ConfirmOrLoadingWrapper = styled.div<{ type?: GovernanceType }>`
  width: ${({ type }) => (type === GovernanceType.SAR_NFT ? '1080px' : '100%')};
  overflow-y: auto;
  border-radius: 10px;
  padding: 24px;
  max-height: 500px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`;

export const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`;

export const Wrapper = styled(Box)`
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
  justify-content: space-between;
`;

export const ErrorWrapper = styled(Box)`
  display: grid;
  grid-template-rows: minmax(100px, auto) max-content;
  height: 100%;
  padding: 10px;
`;

export const ErrorBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
