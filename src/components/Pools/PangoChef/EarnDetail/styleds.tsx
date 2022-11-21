import styled from 'styled-components';
import { Box } from 'src/components';

export const Wrapper = styled(Box)`
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.color2};
  margin-top: 10px;
  padding: 10px;
  height: 310px;
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

export const Container = styled(Box)`
  display: grid;
  grid-gap: 5px;
  margin-top: 10px;
  flex: 1;
  width: 100%;
`;

export const Buttons = styled(Box)`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 1fr 1fr;
  margin-top: 10px;
`;
