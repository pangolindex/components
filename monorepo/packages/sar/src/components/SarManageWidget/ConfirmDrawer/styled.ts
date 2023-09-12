import { Box, Text } from '@honeycomb/core';
import styled from 'styled-components';

export const Root = styled(Box)`
  display: grid;
  grid-template-rows: auto max-content;
  height: 100%;
  padding: 20px;
`;

export const ErrorWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
`;

export const ErrorBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  flex: 1;
  width: 100%;
  flex-wrap: wrap;
  word-wrap: break-word;
`;

export const ErrorText = styled(Text)`
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.red1};
  text-align: center;
  word-wrap: break-word;
  width: 100%;
`;

export const SubmittedWrapper = styled(Box)`
  display: grid;
  grid-template-rows: auto max-content;
  height: 100%;
`;

export const Link = styled(Text)`
  text-decoration: none;
  color: ${({ theme }) => theme.blue1};
`;

export const Header = styled(Box)`
  padding: 0px 10px;
  display: grid;
  grid-gap: 10px;
`;

export const TokenRow = styled(Box)`
  display: grid;
  grid-template-columns: max-content max-content;
  align-items: center;
`;

export const Footer = styled(Box)`
  padding: 0px 10px;
`;
