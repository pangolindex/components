import styled from 'styled-components';
import { Box } from 'src/components/Box';

export const Route = styled(Box)<{ selected: boolean }>`
  background-color: ${({ theme }) => theme.bridge?.primaryBgColor};
  border-radius: 10px;
  padding: 30px;
  border: ${({ theme, selected }) => (selected ? `1px solid ${theme.primary}` : 'none')};
`;

export const Informations = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const Information = styled(Box)`
  padding: 9px 13px;
  background-color: ${({ theme }) => theme.bridge?.informationBoxesBackgroundColor};
  border-radius: 10px;
`;

export const StepDetail = styled(Box)<{ lastItem: boolean }>`
  min-height: 10vh;
  padding-left: 27px;
  margin-left: 10px;
  margin-bottom: 0.5rem;
  border-left: ${({ theme, lastItem }) => (lastItem ? 'none' : `1px solid ${theme.primary}`)};
`;
