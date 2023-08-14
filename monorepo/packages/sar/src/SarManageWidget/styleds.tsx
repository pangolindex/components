import { Box } from '@pangolindex/core';
import styled from 'styled-components';

export const Wrapper = styled(Box)`
  border-radius: 10px;
  width: 100%;
  background-color: ${({ theme }) => theme.color2};
  position: relative;
  overflow: hidden;
  padding: 30px;
  box-sizing: border-box;
`;
