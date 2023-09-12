import { Box, TabPanel } from '@honeycomb/core';
import styled from 'styled-components';

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

export const Partners = styled(Box)`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 30px;
`;

export const PartnerLogos = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  padding: 30px;
  flex-wrap: wrap;
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

export const LoaderWrapper = styled(Box)`
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 999;
  position: absolute;
  align-items: center;
  pointer-events: all;
  justify-content: center;
  background-color: ${({ theme }) => theme.bridge?.secondaryBgColor + '70'}; // opacity 70%
`;

export const CustomTabPanel = styled(TabPanel)`
  position: relative;
`;
