import styled from 'styled-components';
import { Box, Text } from '../../..';

export const Root = styled(Box)`
  display: grid;
  grid-template-rows: auto max-content;
  height: 100%;
  padding: 20px;
`;

export const ErrorWrapper = styled(Box)`
  display: grid;
  grid-template-rows: minmax(300px, auto) max-content;
  height: 100%;
  padding: 30px;
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
  padding: 30px;
`;

export const Link = styled(Text)`
  text-decoration: none;
  color: ${({ theme }) => theme.blue1};
`;
