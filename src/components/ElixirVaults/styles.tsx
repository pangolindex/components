import styled from 'styled-components';
import { Box } from 'src/components';

export const Row = styled(Box)`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
`;

export const DoubleLogo = styled(Box)`
  display: flex;
`;

export const LogoImage = styled.img`
  &:not(:first-child) {
    margin-left: -5px; /* Apply margin to all images except the first one */
  }
  width: 2rem;
  height: 2rem;
`;

export const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  margin: auto;
  padding: 0px 10px;
`;

export const LoaderWrapper = styled(Box)<{ paddingRight: string }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding-right: ${({ paddingRight }) => paddingRight}
  pointer-events: all;
  position: absolute;
  width: 100%;
  z-index: 999;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-right: 0px;
  `};
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
