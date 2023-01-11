import styled from 'styled-components';
import { Box } from '@components/index';

export const MainContent = styled.div`
  &&& {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin-left: 0;
      width : 100%;
    `};
  }
`;

export const AppContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 100px;
  padding: 0px 1rem;
  height: 100%;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding:16px;
    padding-bottom: 70px;
  `};

  z-index: 1;
`;

export const Wrapper = styled(Box)`
  flex: 1;
`;
