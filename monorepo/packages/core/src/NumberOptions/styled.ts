import styled from 'styled-components';
import { Box } from '../Box';

export const PValue = styled(Box)<{ isActive: boolean }>`
  margin-left: 3px;
  margin-right: 3px;
  align-items: center;
  display: flex;
  width: 100%;
  font-size: 12px;
  padding: 5px;
  color: ${({ theme, isActive }) => (isActive ? theme.numberOptions?.activeTextColor : theme.numberOptions?.text)};
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.numberOptions?.activeBackgroundColor : theme.numberOptions?.inactiveBackgroundColor};
  border: ${({ theme, isActive }) => (isActive ? 0 : `1px solid ${theme.numberOptions?.borderColor}`)};
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  justify-content: center;
`;
