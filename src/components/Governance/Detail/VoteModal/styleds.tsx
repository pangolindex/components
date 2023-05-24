import styled from 'styled-components';
import { Box } from 'src/components';
import { AutoColumn, ColumnCenter } from 'src/components/Column';

export const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`;

export const ConfirmOrLoadingWrapper = styled.div`
  width: 100%;
  padding: 24px;
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
