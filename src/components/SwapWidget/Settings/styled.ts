import styled from 'styled-components';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';

export const Frame = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
  padding: 10px;
`;

export const InputOptions = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

export const WarningButton = styled(Button)`
  background-color: ${({ theme }) => theme.error};
  color: white;
`;

export const Close = styled(Button)`
  position: absolute;
  top: 15px;
  right: 15px;
  color: ${({ theme }) => theme.swapWidget?.primary};
  width: 30px;
  height: 30px;
`;

export const ModalFrame = styled(Box)`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: justify;
  position: relative;

  width: 25vw;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100% !important;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 50vw;
  `};
`;

export const SettingsButton = styled(Box)`
  background-color: ${({ theme }) => theme.swapWidget?.interactiveBgColor};
  color: ${({ theme }) => theme.swapWidget?.interactiveColor};
  border-radius: 4px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover,
  &:focus {
    opacity: 0.8;
  }
`;
