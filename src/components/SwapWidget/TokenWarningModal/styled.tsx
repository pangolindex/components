import { transparentize } from 'polished';
import { AlertTriangle } from 'react-feather';
import styled from 'styled-components';

export const Wrapper = styled.div<{ error: boolean }>`
  background: ${({ theme }) => transparentize(0.6, theme.swapWidget?.backgroundColor as string)};
  padding: 0.75rem;
  border-radius: 20px;
`;

export const WarningContainer = styled.div`
  max-width: 420px;
  width: 100%;
  padding: 1rem;
  background: ${({ theme }) => transparentize(0.9, theme.error)};
  border: 1px solid ${({ theme }) => theme.error};
  border-radius: 20px;
  overflow: auto;
`;

export const StyledWarningIcon = styled(AlertTriangle)`
  stroke: ${({ theme }) => theme.error};
`;

export const AutoColumn = styled.div<{
  gap?: 'sm' | 'md' | 'lg' | string;
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between';
}>`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => (gap === 'sm' && '8px') || (gap === 'md' && '12px') || (gap === 'lg' && '24px') || gap};
  justify-items: ${({ justify }) => justify && justify};
`;
