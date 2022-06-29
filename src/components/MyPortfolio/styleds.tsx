import styled from 'styled-components';
import { Box } from '../Box';

export const Root = styled(Box)`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;

  padding: 20px;

  border-radius: 10px;
  background-color: ${({ theme }) => theme.color2};
`;

export const Header = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 5px;
`;

export const SelectedCard = styled(Box)<{ selected: boolean }>`
  height: 60px;

  background-color: ${({ theme, selected }) => (selected ? theme.bg3 : theme.bg6)};
  padding: 2px;
  border-radius: 4px;
  display: flex;
  flex-direction: row;

  justify-content: center;
  align-items: center;

  gap: 10px;
  cursor: pointer;

  font-weight: 500;

  &:hover,
  &:focus {
    opacity: 0.8;
  }
`;

export const Frame = styled(Box)`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
`;

export const RowWrapper = styled(Box)`
  padding: 0px 10px;
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.text9};
  border-radius: 4px 4px 0px 0px;
  background-color: ${({ theme }) => theme.color2};

  height: 64px;

  &:hover {
    background-color: ${({ theme }) => theme.color3};
  }
`;

export const Body = styled(Box)`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

  grid-gap: 20px;
`;
