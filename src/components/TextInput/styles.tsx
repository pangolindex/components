import styled from 'styled-components';
import { Box } from '../Box';
import { Text } from '../Text';
import { TextInputProps } from './types';

export const InputWrapper = styled(Box)`
  width: 100%;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid transparent;
  display: flex;
  position: relative;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.textInput?.backgroundColor};
  color: ${({ theme }) => theme.textInput?.text};
  input {
    background-color: inherit;
  }
`;
export const StyledInput = styled.input<TextInputProps>`
  flex: 1;
  border: 1px solid transparent;
  font-size: ${(props) => (props?.fontSize ? `${props?.fontSize}px` : '18px')};
  color: ${({ theme }) => theme.textInput?.text};
  background-color: ${({ theme }) => theme.textInput?.backgroundColor};
  outline: none;
  width: 100%;
  padding: 0;
  cursor: ${(props) => (props?.disabled ? 'not-allowed' : 'default')};
  -moz-appearance: textfield;
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::placeholder {
    color: ${({ theme }) => theme.textInput?.placeholderText};
  }
`;
export const AddonAfter = styled(Box)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const AddonBefore = styled(Box)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const ErrorText = styled(Text)`
  margin-top: 5px;
  color: ${({ theme }) => theme.red2};
  font-size: 12px;
`;
