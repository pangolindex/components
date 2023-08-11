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
