import { opacify } from 'polished';
import styled from 'styled-components';

export const ChainList = styled.div`
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

export const ChainRowRoot = styled.div<{ disabled: boolean; selected: boolean }>`
  min-height: 56px;
  font-size: 16px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) minmax(0, 72px);
  grid-gap: 16px;
  align-items: center;
  padding: 10px 30px;

  &:hover {
    background-color: ${({ theme, disabled }) =>
      !disabled && opacify(0.9, theme.swapWidget?.detailsBackground as string)};
  }

  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`;

export const ChainLogo = styled.img`
  border-radius: 50%;
`;
