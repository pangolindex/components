import styled from 'styled-components';
import { Box, CurrencyInput, TextInput } from 'src/components';

export const Root = styled(Box)`
  width: 100%;
  max-width: 470px;
  background-color: ${({ theme }) => theme.color8};
  border-radius: 10px;
  position: relative;
  overflow: hidden;
`;
export const Wrapper = styled(Box)<{ maximumHeight: number }>`
  position: relative;
  width: 100%;
  overflow: auto;
  height: 100%;
  max-height: ${({ maximumHeight }) => maximumHeight}px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 100%;
    width: 100%;
    max-height: 100%;
  `};
`;

export const CurrencyInputTextBox = styled(CurrencyInput)`
  align-items: center;
  border-radius: 4px;
`;

export const PValue = styled(Box)<{ isActive: boolean }>`
  margin-left: 7px;
  margin-right: 7px;
  align-items: center;
  display: flex;
  width: 100%;
  font-size: 16px;
  color: ${({ theme, isActive }) => (isActive ? theme.swapWidget?.primary : theme.swapWidget?.secondary)};
  border-bottom: ${({ theme, isActive }) => (isActive ? `1px solid ${theme.swapWidget?.primary}` : 0)};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.swapWidget?.primary};
  }
`;

export const CurrencyInputs = styled(Box)`
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

export const InputText = styled(TextInput)`
  background-color: ${({ theme }) => theme.bg6};
  align-items: center;
  border-radius: 4px;
`;

export const InputWrapper = styled(Box)`
  display: grid;
  grid-auto-flow: 'row';
  grid-auto-columns: minmax(0, 1fr);
  margin-top: '10px';
  grid-gap: 5px;
  align-items: 'normal';
`;

export const InputValue = styled(Box)`
  background-color: ${({ theme }) => theme.bg6};
  padding: 15px;
  display: flex;
  justify-content: space-between;
  border-radius: 4px;
  justify-content: 'flex-start';
`;

export const DynamicSection = styled(Box)<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'initial')};
`;

export const Buttons = styled(Box)`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  grid-gap: 10px;
  margin-top: 10px;
`;

export const ButtonWrapper = styled(Box)`
  justify-content: space-between;
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
`;
