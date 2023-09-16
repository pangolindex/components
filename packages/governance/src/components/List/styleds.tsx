import { Box, Button, Text } from '@honeycomb-finance/core';
import { ExternalLink } from '@honeycomb-finance/shared';
import styled from 'styled-components';

export const PageWrapper = styled(Box)`
  width: 100%;
`;

export const PageTitle = styled(Box)`
  font-weight: 500;
  font-size: 32px;
  line-height: 52px;
  color: ${({ theme }) => theme.text7};
  margin-top: 105px;
  margin-bottom: 28px;
  display: flex;
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 12px;
  `};
`;

export const ContentWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  flex-direction: column;
  max-width: 1080px;
  margin: auto;
  margin-bottom: 20px;
`;

export const About = styled(Box)`
  padding: 18px 30px 32px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 8px;
`;

export const WrapSmall = styled(Box)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    width: 100%;
  display: flex;
  padding: 0;
  align-items: 'center';
  justify-content: space-between;
  `};
`;

export const TextButton = styled(Text)`
  color: ${({ theme }) => theme.primary1};
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

export const AddressButton = styled.div`
  border: 1px solid ${({ theme }) => theme.bg3};
  padding: 2px 4px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const StyledExternalLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.text1};
`;

export const DefaultButton = styled(Button)`
  font-size: 18px;
  font-weight: normal !important;
  line-height: 25px;
  border-radius: 8px !important;
  width: 200px !important;
  height: 46px !important;
  margin-top: 16px;
`;

export const DelegateWarpper = styled(Box)`
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
  justify-content: space-between;
`;
export const DelegatInfo = styled(Box)`
  width: fit-content;
  display: flex;
  padding: 0;
  align-items: center;
`;
