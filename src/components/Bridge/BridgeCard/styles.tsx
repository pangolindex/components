import styled from 'styled-components';
import { Box, Text } from 'src/components';

export const Wrapper = styled(Box)`
  background-color: ${({ theme }) => theme.bridge?.secondaryBgColor};
  border-radius: 10px;
  padding: 30px;
  margin-top: 30px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
  max-width: 30%;
  min-width: 30%;
  height: fit-content;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 90%;
    max-width: 90%;
  `};
`;

export const FilterBox = styled(Box)`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

export const FilterInputHeader = styled(Text)`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.bridge?.text};
  margin-bottom: 10px;
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
  background-color: ${({ theme }) => theme.bridge?.secondaryBgColor};
  margin: -30px;
`;

export const CloseCircle = styled.div<{ onClick: () => void }>`
  position: absolute;
  top: 30px;
  right: 30px;
  cursor: pointer;
  background-color: ${({ theme }) => theme.closeCircleBG};
  padding: 2.5px 8px;
  -moz-border-radius: 50px;
  -webkit-border-radius: 50px;
  border-radius: 50px;
`;

export const BottomText = styled(Text)`
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.bridge?.text};
  position: absolute;
  bottom: 0;
  padding: 30px;
  text-align: center;
`;

export const ArrowWrapper = styled.div`
  background-color: ${({ theme }) => theme.bridge?.primaryBgColor};
  width: 30px;
  height: 30px;
  border-radius: 50%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
`;
