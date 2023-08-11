import styled, { css } from 'styled-components';

export const StyledTable = styled.table<{ styleOverride?: string }>`
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  ${(props) =>
    props.styleOverride &&
    css`
      ${props.styleOverride}
    `};
`;

export const SortableHeader = styled.div<{ canSort: boolean }>`
  ${({ canSort }) => (canSort ? 'cursor: pointer; user-select: none;' : '')}
`;

export const StyledTH = styled.th<{ styleOverride?: string }>`
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid ${({ theme }) => theme.dataTable?.primaryColor};
  border-right: 1px solid ${({ theme }) => theme.dataTable?.primaryColor};
  &:last-child {
    border-right: none;
  }
  ${(props) =>
    props.styleOverride &&
    css`
      ${props.styleOverride}
    `};
`;

export const StyledTR = styled.tr<{ styleOverride?: string }>`
  border-bottom: 1px solid ${({ theme }) => theme.dataTable?.primaryColor};
  ${(props) =>
    props.styleOverride &&
    css`
      ${props.styleOverride}
    `};
`;

export const StyledTD = styled.td<{ styleOverride?: string }>`
  padding: 8px;
  text-align: left;
  border-right: 1px solid ${({ theme }) => theme.dataTable?.primaryColor};
  &:last-child {
    border-right: none;
  }
  border-bottom: 1px solid ${({ theme }) => theme.dataTable?.primaryColor};
  ${(props) =>
    props.styleOverride &&
    css`
      ${props.styleOverride}
    `};
`;
