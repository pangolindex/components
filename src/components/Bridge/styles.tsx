import styled from 'styled-components';
import { Box } from '../Box';
import { Tab, TabList, TabPanel, Tabs } from '../Tabs';

export const PageWrapper = styled(Box)`
  width: 100%;
  display: flex;
  justify-content: start;
  gap: 30px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `};
`;

export const Transactions = styled(Box)`
  background-color: ${({ theme }) => theme.color2};
  min-width: 70%;
  max-width: 70%;
  border-radius: 16px;
  height: fit-content;
  padding: 30px;
  margin-top: 30px;
  margin-bottom: 30px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 90%;
    max-width: 90%;
  `};
`;

export const STabs = styled(Tabs)`
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
`;

export const STabList = styled(TabList)`
  color: ${({ theme }) => theme.color11}
  list-style-type: none;
  padding-bottom: 5px;
  padding-left: 0px;
  display: flex;
  justify-content: flex-start;
  gap: 2.5rem;
  margin: 0;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    overflow: auto;
    white-space: nowrap;
  `};
  &::-webkit-scrollbar {
    display: none !important;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;
STabList['tabsRole'] = 'TabList';

export const STab = styled(Tab)`
  padding: 4px;
  user-select: none;
  cursor: arrow;

  &:hover {
    color: ${({ theme }) => theme.primary};
    cursor: pointer;
  }

  &.react-tabs__tab--disabled {
    color: ${({ theme }) => theme.color9};
    cursor: not-allowed;
    &:hover {
      color: ${({ theme }) => theme.color9};
      cursor: default;
    }
  }

  &.is-selected {
    border-bottom: 3px solid ${({ theme }) => theme.primary};
  }

  &:focus {
    outline: none;
  }
`;
STab['tabsRole'] = 'Tab';

export const STabPanel = styled(TabPanel)`
  display: none;
  min-height: 40vh;
  border-top: 1px solid ${({ theme }) => theme.color9};
  padding: 4px;
  margin-top: -5px;

  &.is-selected {
    display: block;
  }
`;
STabPanel['tabsRole'] = 'TabPanel';

export const Routes = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 30px;
  margin-top: 50px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    flex-direction: column;
  `};
`;

export const Transfers = styled.table`
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding-top: 50px;
  padding-bottom: 30px;
  overflow-y: auto;
  white-space: nowrap;
  width: 100%;
`;
