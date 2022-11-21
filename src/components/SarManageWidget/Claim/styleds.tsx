import styled from 'styled-components';
import { Box } from 'src/components/Box';

export const Root = styled(Box)`
  width: 100%;
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(auto-fit, minmax(0, 1fr));
  grid-gap: 16px;
`;

export const Buttons = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;
`;
