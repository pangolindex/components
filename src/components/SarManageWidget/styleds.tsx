import styled from 'styled-components';
import { Box } from 'src/components/Box';

export const Wrapper = styled(Box)`
  border-radius: 10px;
  width: 100%;
  background-color: ${({ theme }) => theme.color2};
  position: relative;
  overflow: hidden;
  padding: 30px;
  box-sizing: border-box;
`;
