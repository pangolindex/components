import styled from 'styled-components';
import { Box } from 'src/components';

export const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  margin: auto;
  padding: 0px 10px;
`;

export const MobileGridContainer = styled(Box)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: grid;
    grid-gap: 8px;
    grid-template-columns: minmax(auto, 50%) minmax(auto, 50%);
    margin-bottom: 10px;
  `};
`;

export const PanelWrapper = styled.div`
  align-items: start;
  display: inline-grid;
  gap: 15px;
  grid-template-columns: 1fr;
  grid-template-rows: max-content;
  padding-bottom: 65px;
  width: 100%;
`;

export const PoolsWrapper = styled(Box)`
  background-color: ${({ theme }) => theme.color2};
  border-radius: 0px;
  color: ${({ theme }) => theme.text7};
  overflow: hidden;
  padding: 10px;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-bottom : 50px;
  `};
`;

export const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;
  padding-bottom: 24px;
  padding-top: 24px;
  white-space: nowrap;
  width: 100%;
`;
