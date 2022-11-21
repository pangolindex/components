import styled from 'styled-components';
import { Box, CurrencyInput } from '../../';

export const Root = styled(Box)`
  width: 100%;
  /* min-width: 360px; */
  position: relative;
  overflow: hidden;
`;

export const SwapWrapper = styled(Box)<{ showRoute?: boolean }>`
  border-bottom-left-radius: ${({ showRoute }) => (showRoute ? `0px` : `10px`)};
  border-bottom-right-radius: ${({ showRoute }) => (showRoute ? `0px` : `10px`)};
  width: 100%;
  /* min-width: 360px; */
  background-color: ${({ theme }) => theme.swapWidget?.backgroundColor};
  position: relative;
  overflow: hidden;
`;

export const CurrencyInputTextBox = styled(CurrencyInput)`
  align-items: center;
  border-radius: 4px;
`;

export const ArrowWrapper = styled.div`
  background-color: ${({ theme }) => theme.swapWidget?.interactiveBgColor};
  width: 30px;
  height: 30px;
  border-radius: 50%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
`;

export const PValue = styled(Box)<{ isActive: boolean }>`
  margin-left: 7px;
  margin-right: 7px;
  align-items: center;
  display: flex;
  width: 100%;
  font-size: 16px;
  color: ${({ theme, isActive }) => (isActive ? theme.swapWidget?.primary : theme.swapWidget?.secondary)};
  border-bottom: ${({ theme, isActive }) => (isActive ? `1px solid ${theme.swapWidget?.primary}` : 0)};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.swapWidget?.primary};
  }
`;

export const LinkStyledButton = styled.button<{ disabled?: boolean }>`
  border: none;
  text-decoration: none;
  background: none;

  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  color: ${({ theme, disabled }) => (disabled ? theme.swapWidget?.secondary : theme.swapWidget?.primary)};
  font-weight: 500;

  :hover {
    text-decoration: ${({ disabled }) => (disabled ? null : 'underline')};
  }

  :focus {
    outline: none;
    text-decoration: ${({ disabled }) => (disabled ? null : 'underline')};
  }

  :active {
    text-decoration: none;
  }
`;
