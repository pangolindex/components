import { Box } from '@honeycomb-finance/core';
import styled from 'styled-components';

export const Wrapper = styled(Box)`
  width: 100%;
  overflow: hidden;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.color2};
  margin-top: 10px;
  padding: 10px;
  height: 270px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
