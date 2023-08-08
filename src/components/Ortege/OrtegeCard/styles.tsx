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

  height: fit-content;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 90%;
    max-width: 90%;
  `};
`;

export const CardWrapper = styled(Box)`
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

export const TransactionText = styled(Text)`
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.bridge?.text};
  padding: 30px;
  text-align: center;
`;

export const ArrowWrapper = styled.div<{ clickable: boolean }>`
  background-color: ${({ theme }) => theme.bridge?.primaryBgColor};
  width: 30px;
  height: 30px;
  border-radius: 50%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    ${({ clickable }) => (clickable ? `cursor: pointer; opacity: 0.8;` : `cursor: not-allowed;`)}
  }
`;

export const ChainsWrapper = styled(Box)`
  display: grid;
  grid-template-columns: 0.4fr 0.2fr 0.4fr;
  grid-gap: 5px;
  align-items: center;
`;

export const StyledBalanceMax = styled.button`
  height: 28px;
  background-color: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 0.5rem;
  font-size: 0.875rem;

  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.text2};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`;

export const TokenWrapper = styled(Box)`
  margin-top: 10px;
  display: grid;
  grid-template-columns: 0.5fr 0.5fr;
  grid-gap: 5px;
`;
