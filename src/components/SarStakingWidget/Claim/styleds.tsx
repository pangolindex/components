import styled from 'styled-components';
import { Box } from '../../Box';

export const Root = styled(Box)`
  width: 100%;
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(auto-fit, minmax(0, 1fr));
  grid-gap: 16px;
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
