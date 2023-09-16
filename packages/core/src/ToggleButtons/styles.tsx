import styled from 'styled-components';

export const Root = styled.div`
  flex-direction: row;
  display: inline-flex;
  background: ${({ theme }) => theme.toggleButton?.backgroundColor};
  border-radius: 4px;
  align-items: center;
  padding: 2px;
  width: 100%;
  box-sizing: border-box;
`;

export const TextButton = styled.div<{
  selected: boolean;
}>`
  margin-right: 4px;
  background: ${({ theme, selected }) =>
    selected ? theme.toggleButton?.selectedColor : theme.toggleButton?.backgroundColor};
  color: ${({ theme }) => theme.toggleButton?.fontColor};
  border-radius: 4px;
  padding: 3px 5px;
  cursor: pointer;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:last-child {
    margin-right: 0px;
  }
`;
