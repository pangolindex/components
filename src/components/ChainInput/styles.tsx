import styled from 'styled-components';
import { ButtonStyleProps } from '../Button/types';

export const ChainSelect = styled.button<{ selected: boolean; buttonStyle: ButtonStyleProps | undefined }>`
  align-items: center;
  height: 100%;
  font-size: 16px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.chainInput?.primaryBgColor};
  color: ${({ theme }) => theme.chainInput?.text};
  border-radius: 12px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;

  ${({ buttonStyle }) => buttonStyle}
`;

export const Aligner = styled.span<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: inherit;
  svg {
    stroke: ${({ theme }) => theme.chainInput?.text};
  }
`;

export const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  16px;
  color: inherit;
`;

export const ChainLogo = styled.img`
  border-radius: 50%;
`;
