import { Box } from '@honeycomb-finance/core';
import styled from 'styled-components';

export const Root = styled(Box)`
  width: 100%;
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(auto-fit, minmax(0, 1fr));
  grid-gap: 16px;
`;
