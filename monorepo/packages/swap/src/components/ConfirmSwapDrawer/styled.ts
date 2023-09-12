import { Box, Text } from '@honeycomb/core';
import styled from 'styled-components';

export const Root = styled(Box)`
  display: grid;
  grid-template-rows: auto max-content;
  height: 100%;
`;

export const Header = styled(Box)`
  padding: 0px 10px;
`;

export const TokenRow = styled(Box)`
  display: grid;
  grid-template-columns: max-content auto max-content;
  align-items: center;
`;

export const PriceUpdateBlock = styled(Box)`
  padding: 10px;
  background-color: ${({ theme }) => theme.swapWidget?.detailsBackground};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  margin-top: 15px;
`;

export const OutputText = styled(Text)`
  width: 100%;
  font-style: italic;
  font-size: 12px;
  text-align: left;
`;

export const Footer = styled(Box)`
  padding: 0px 10px;
`;

export const ErrorWrapper = styled(Box)`
  display: grid;
  grid-template-rows: minmax(300px, auto) max-content;
  height: 100%;
  padding: 10px;
  word-wrap: break-word;
`;

export const ErrorBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const SubmittedWrapper = styled(Box)`
  display: grid;
  grid-template-rows: minmax(300px, auto) max-content;
  height: 100%;
  padding: 10px;
`;

export const Link = styled(Text)`
  text-decoration: none;
`;
