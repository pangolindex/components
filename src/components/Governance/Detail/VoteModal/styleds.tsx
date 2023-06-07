import { GovernanceType } from '@pangolindex/sdk';
import styled from 'styled-components';
import { Box } from 'src/components';
import { AutoColumn, ColumnCenter } from 'src/components/Column';

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
