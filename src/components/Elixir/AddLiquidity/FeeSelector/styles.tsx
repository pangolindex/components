import styled, { keyframes } from 'styled-components';
import { Box } from 'src/components';

const pulse = (color: string) => keyframes`
  0% {
    box-shadow: 0 0 0 0 ${color};
  }

  70% {
    box-shadow: 0 0 0 2px ${color};
  }

  100% {
    box-shadow: 0 0 0 0 ${color};
  }
`;

export const Wrapper = styled(Box)<{ selected: boolean }>`
  background-color: ${({ theme }) => theme?.color3};
  border: ${({ theme, selected }) => (selected ? `1px solid ${theme.primary}` : 'none')};
  width: 100%;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  display: grid;
  grid-auto-rows: auto;
  row-gap: 8px;
  justify-items: flex-start;
`;

export const BlackBox = styled(Box)`
  background-color: ${({ theme }) => theme.elixir?.secondaryBgColor};
  border-radius: 7px;
  display: flex;
  flex-direction: row;
  padding: 4px 6px;
  -webkit-box-pack: center;
  justify-content: center;
  font-weight: 500;
`;

export const CheckBox = styled(Box)`
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.5rem;
`;

export const FeeTiers = styled(Box)`
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-top: 6px;
`;

export const FeeSelectorWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
`;

export const FocusedOutlineCard = styled(Box)<{ pulsing: boolean }>`
  width: 100%;
  padding: 1rem;
  border-radius: 16px;
  animation: ${({ pulsing, theme }) => pulsing && pulse(theme.bg2)} 0.6s linear;
  align-self: center;
  background-color: ${({ theme }) => theme.color3};
`;

export const SelectFeeTierWrapper = styled.div`
  display: grid;
  grid-auto-rows: auto;
`;

export const DynamicSection = styled(Box)<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'initial')};
  display: grid;
  grid-auto-rows: auto;
`;

export const RowBetween = styled(Box)`
  width: '100%';
  display: flex;
  padding: 0;
  align-items: 'center';
  justify-content: 'flex-start';
  justify-content: space-between;
`;
