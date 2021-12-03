import styled from 'styled-components';

export const Root = styled.div`
  flex-direction: row;
  display: flex;
  height: 32px;
  background: ${({ theme }) => theme.text4};
  border-radius: 4px;
  align-items: center;
  width: auto;
`;

export const TextButton = styled.div<{
  selected: boolean;
}>`
  margin-left: 2px;
  margin-right: 2px;
  background: ${({ theme, selected }) => (selected ? theme.bg6 : theme.text4)};
  color: ${({ theme }) => theme.text2};
  border-radius: 4px;
  padding: 3px;
  cursor: pointer;
`;
