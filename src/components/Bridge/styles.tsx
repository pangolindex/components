import styled from 'styled-components';
import { Box } from '../Box';

export const PageWrapper = styled(Box)`
  width: 100%;
  display: flex;
  justify-content: start;
  gap: 30px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `};
`;

export const Transactions = styled(Box)`
  background-color: ${({ theme }) => theme.bridge?.secondaryBgColor};
  min-width: 70%;
  max-width: 70%;
  border-radius: 16px;
  height: fit-content;
  padding: 30px;
  margin-top: 30px;
  margin-bottom: 30px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 90%;
    max-width: 90%;
  `};
`;

export const Routes = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 30px;
  margin-top: 50px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    flex-direction: column;
  `};
`;

export const Transfers = styled.table`
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding-top: 50px;
  padding-bottom: 30px;
  overflow-y: auto;
  white-space: nowrap;
  width: 100%;
`;
