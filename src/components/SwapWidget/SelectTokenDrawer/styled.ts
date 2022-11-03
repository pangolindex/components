import { opacify } from 'polished';
import styled from 'styled-components';
import { Box, Text } from 'src/components';

export const CurrencyList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none !important;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const CurrencyRoot = styled(Box)<{ disabled: boolean; selected: boolean }>`
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.color3};
  border-radius: 8px;

  &:hover {
    background-color: ${({ theme, disabled }) =>
      !disabled && opacify(0.9, theme.swapWidget?.detailsBackground as string)};
  }

  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`;

export const Balance = styled(Text)`
  justify-self: flex-end;
  white-space: nowrap;
`;

export const ManageList = styled.div`
  background-color: ${({ theme }) => theme.swapWidget?.detailsBackground};
  padding: 10px 20px;
  cursor: pointer;
`;

export const ListLogo = styled.img<{ size: number }>`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  margin-right: 10px;
`;
