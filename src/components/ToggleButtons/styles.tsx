import styled from 'styled-components';

export const Root = styled.div`
  flex-direction: row;
  display: inline-flex;
  background: ${({ theme }) => theme.text4};
  border-radius: 4px;
  align-items: center;
  padding: 2px;
`;

export const TextButton = styled.div<{
  selected: boolean;
}>`
  margin-right: 4px;
  background: ${({ theme, selected }) => (selected ? theme.bg6 : theme.text4)};
  color: ${({ theme }) => theme.text2};
  border-radius: 4px;
  padding: 3px 5px;
  cursor: pointer;

  &:last-child {
    margin-right: 0px;
  }
`;
