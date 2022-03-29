import styled from 'styled-components';
import { Box } from '../Box';

export const Root = styled(Box)`
  width: 100%;
  min-width: 320px;
  position: relative;
  overflow: hidden;

  * {
    box-sizing: border-box;
  }
`;
