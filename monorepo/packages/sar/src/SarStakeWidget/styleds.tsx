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

export const Wrapper = styled(Box)`
  border-radius: 10px;
  width: 100%;
  background-color: ${({ theme }) => theme.color2};
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;
`;

export const Buttons = styled(Box)<{ isStaked?: boolean }>`
  display: grid;
  grid-auto-flow: ${({ isStaked }) => (isStaked ? 'column' : 'row')};
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  grid-gap: 10px;
  margin-top: 5px;
`;
