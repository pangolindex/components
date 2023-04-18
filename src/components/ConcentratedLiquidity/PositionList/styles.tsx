import styled from 'styled-components';
import { Box } from 'src/components';

export const PoolsWrapper = styled(Box)`
  width: 100%;
  background-color: ${({ theme }) => theme.color2};
  padding: 10px;
  border-radius: 0px;
  overflow: hidden;
  color: ${({ theme }) => theme.text7};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-bottom : 50px;
  `};
`;

export const LoaderWrapper = styled(Box)`
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 999;
  position: absolute;
  align-items: center;
  pointer-events: all;
  justify-content: center;
  padding-right: 200px; // sidebar width
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-right: 0px;
  `};
`;

export const PanelWrapper = styled.div`
  display: inline-grid;
  grid-template-columns: 1fr;
  grid-template-rows: max-content;
  gap: 15px;
  width: 100%;
  align-items: start;
  padding-bottom: 65px;
`;

export const MobileGridContainer = styled(Box)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: grid;
    grid-template-columns: minmax(auto, 50%) minmax(auto, 50%);
    grid-gap: 8px;
    margin-bottom : 10px;
  `};
`;
