import styled from 'styled-components';
import { Box, Text } from 'src/components';

export const Wrapper = styled(Box)<{ selected: boolean }>`
  display: flex;
  background-color: ${({ theme }) => theme?.concentratedLiquidity?.primaryBgColor};
  border: ${({ theme, selected }) => (selected ? `1px solid ${theme.primary}` : 'none')};
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
`;

export const BlackBox = styled(Box)`
  background-color: ${({ theme }) => theme.concentratedLiquidity?.secondaryBgColor};
  border-radius: 7px;
  display: flex;
  flex-direction: row;
`;

export const BlackBoxContent = styled(Text)`
  padding: 0.1rem 0.3rem;
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
