import { Box, Text } from '@honeycomb/core';
import { opacify } from 'polished';
import styled from 'styled-components';

export const CurrencyRoot = styled(Box)<{ disabled: boolean; selected: boolean }>`
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  text-align: center;
  word-break: break-all;
  width: 100%;
  hyphens: manual;
`;
