import styled from 'styled-components';

export const CurrencyList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  padding: 0px 10px;
  &::-webkit-scrollbar {
    display: none !important;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const ManageList = styled.div`
  background-color: ${({ theme }) => theme.swapWidget?.detailsBackground};
  padding: 10px 20px;
  cursor: pointer;
`;

export const ListLogo = styled.img<{ size: number }>`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  margin-right: 10px;
`;
