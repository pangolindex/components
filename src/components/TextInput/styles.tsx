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
  background-color: ${({ theme }) => theme.bg6};
  color: ${({ theme }) => theme.text4};
`;
export const StyledInput = styled.input<TextInputProps>`
  flex: 1;
  border: 1px solid transparent;
  font-size: ${(props) => (props?.fontSize ? `${props?.fontSize}px` : '18px')};
  background-color: ${({ theme }) => theme.bg6};
  color: ${({ theme }) => theme.text4};
  outline: none;
  width: 100%;
  padding: 0;
`;
export const AddonAfter = styled(Box)`
  position: relative;
`;
export const AddonBefore = styled(Box)`
  position: relative;
`;
export const ErrorText = styled(Text)`
  margin-top: 5px;
  color: ${({ theme }) => theme.red2};
  font-size: 12px;
`;
