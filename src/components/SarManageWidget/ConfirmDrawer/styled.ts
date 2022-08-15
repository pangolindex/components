import styled from 'styled-components';
import { Box } from 'src/components/Box';
import { Text } from 'src/components/Text';

export const Root = styled(Box)`
  display: grid;
  grid-template-rows: auto max-content;
  height: 100%;
  padding: 20px;
`;

export const ErrorWrapper = styled(Box)`
  display: grid;
  grid-template-rows: auto max-content;
  height: 100%;
`;

export const ErrorBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
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
