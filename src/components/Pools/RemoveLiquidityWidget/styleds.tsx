import styled from 'styled-components';
import { Box } from 'src/components/Box';

export const Wrapper = styled(Box)`
  width: 100%;
  overflow: hidden;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.color2};
  margin-top: 10px;
  padding: 10px;
  height: 250px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
