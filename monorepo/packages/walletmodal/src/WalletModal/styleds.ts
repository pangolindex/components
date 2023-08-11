import styled from 'styled-components';
import { Box, Button, Logo } from '@pangolindex/core';

export const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: ${({ theme }) => theme.color2};
  border-radius: 10px;
  position: relative;

  max-width: 40dvw;
  min-height: 375px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 100dvh;
    max-width: 100dvw;
  `}
`;

export const Header = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: fit-content;
`;

export const Inputs = styled(Box)`
  display: grid;
  grid-auto-flow: column;
  gap: 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-auto-flow: row;
    height: max-content;
    &>:nth-child(2) {
      height: 40px;
    }
  `}
`;

export const ChainFrame = styled(Box)`
  display: grid;
  gap: 10px;
`;

export const WalletFrame = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
  width: inherit;
  padding: 5px 0px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    padding: 5px 10px 10px 0px;
  `}
`;

export const Separator = styled.hr`
  width: 0px;
  height: inherit;
  border: 1px solid #393939;
  border-radius: 2px;
  margin-left: 10px;
  margin-right: 10px;
`;

export const StyledLogo = styled(Logo)`
  height: 40px;
  width: 40px;
`;

export const ChainButton = styled(Button)`
  width: 68px;
`;

export const Bookmark = styled(Box)`
  background-color: ${({ theme }) => theme.primary};
  border-radius: 0px 4px 4px 0px;
  height: 50%;
  width: 5px;
  position: absolute;
  left: 0px;
`;

export const WalletButton = styled(Button)`
  display: grid;
  justify-items: center;
  align-content: baseline;
  min-height: 90px;
  gap: 5px;
  background-color: ${({ theme }) => theme.color3};
  border-radius: 8px;
  padding: 10px;
  position: relative;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-auto-flow: column;
    align-content: center;
    justify-content: flex-start;
    padding-left: 20px;
    padding-right: 20px;
    min-height: 60px;
    gap: 10px;
  `}
`;

export const GreenCircle = styled.div`
  height: 8px;
  width: 8px;
  background-color: ${({ theme }) => theme.green1};
  border-radius: 50%;
  position: absolute;
  top: 5px;
  left: 5px;
`;
