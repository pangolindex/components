import styled from 'styled-components';
import { Box } from '../Box';
import { Text } from '../Text';

export const Root = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
export const Link = styled(Text)`
  text-decoration: none;
  color: ${({ theme }) => theme.blue1};
`;
