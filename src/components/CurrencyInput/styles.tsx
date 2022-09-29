import { darken } from 'polished';
import styled from 'styled-components';
import { ButtonStyleProps } from '../Button/types';

export const CurrencySelect = styled.button<{ selected: boolean; buttonStyle: ButtonStyleProps | undefined }>`
  align-items: center;
  height: 100%;
  font-size: 20px;
  font-weight: 500;
  background-color: ${({ selected, theme }) =>
    selected ? theme.currencySelect?.selectedBackgroundColor : theme.currencySelect?.defaultBackgroundColor};
  color: ${({ selected, theme }) =>
    selected ? theme.currencySelect?.selectedText : theme.currencySelect?.defaultText};
  border-radius: 12px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;

  /* :focus,
  :hover {
    background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary))};
  } */

  ${({ buttonStyle }) => buttonStyle}
`;

export const Aligner = styled.span<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: inherit;
  svg {
    stroke: ${({ active, theme }) => (active ? theme.currencySelect?.selectedText : theme.currencySelect?.defaultText)};
  }
`;

export const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
  color: inherit;
`;
