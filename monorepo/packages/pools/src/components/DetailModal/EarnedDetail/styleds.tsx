import { Box } from '@honeycomb/core';
import styled from 'styled-components';

export const Wrapper = styled(Box)`
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.bg2};
  margin-top: 10px;
  padding: 10px;
  min-height: 310px;
  display: flex;
  flex-direction: column;
  * {
    box-sizing: border-box;
  }
`;

export const InnerWrapper = styled(Box)`
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: 12px;
  margin-top: 10px;
`;
