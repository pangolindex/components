import styled from 'styled-components';
import { Text } from '../Text';

export const Root = styled.div<{
  disabled?: boolean;
}>`
  flex-direction: row;
  align-items: center;
  display: flex;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : '')};
`;

export const OuterCircle = styled.div<{
  size: number;
}>`
  width: ${(props) => `${props?.size}px`};
  height: ${(props) => `${props?.size}px`};
  border-radius: 50%;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg4};
  border-color: ${({ theme }) => theme.bg4};
  transition: all ease-in 0.2s;
`;

export const InnerCircle = styled.div<{
  size: number;
  selected?: boolean;
}>`
  width: ${(props) => `${props?.size / 2}px`};
  height: ${(props) => `${props?.size / 2}px`};
  border-radius: 50%;
  background-color: ${({ theme, selected }) => (selected ? theme.bg5 : theme.bg4)};
`;

export const Label = styled(Text)`
  margin-left: 10px;
  font-size: 14px;
  font-weight: 300;
`;
