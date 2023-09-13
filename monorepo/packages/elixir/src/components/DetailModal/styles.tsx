import { Box, Tab, TabList, TabPanel } from '@honeycomb-finance/core';
import styled from 'styled-components';

export const DesktopWrapper = styled(Box)`
  width: 1080px;
  overflow: auto;
  border-radius: 10px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
  * {
    box-sizing: border-box;
  }
`;

export const MobileWrapper = styled(Box)`
  width: 100%;
  height: 100%;
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: block;
    overflow: scroll;
  `};
`;

export const LeftSection = styled(Box)`
  border-right: 2px solid ${({ theme }) => theme.text8 + '33'};
  display: flex;
  flex-direction: column;
`;

export const DetailsWrapper = styled(Box)`
  display: grid;
  grid-template-columns: minmax(auto, 65%) minmax(auto, 35%);
  grid-gap: 0px;
`;

export const CustomTab = styled(Tab)`
  padding: 15px 50px;
  font-size: 18px;
  color: ${({ theme }) => theme.text10};
  background-color: transparent;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    border-radius: 10px 10px 0 0;
  `};

  //Override Tab Styles
  &.is-selected {
    &:hover {
      color: ${({ theme }) => theme.text10};
    }
    background-color: ${({ theme }) => theme.bg2};
    border-bottom: 3px solid ${({ theme }) => theme.bg2};
  }
`;

export const CustomTabList = styled(TabList)`
  // Override TabList Styles
  justify-content: flex-start;
  gap: 0px;
  padding-bottom: 0px;
`;

export const CustomTabPanel = styled(TabPanel)`
  // Override TabPanel Styles
  border-top: 0px;
  margin-top: 0px;
  padding: 0px;
`;

export const RightSection = styled(Box)`
  padding: 20px;
  grid-gap: 20px;
  display: flex;
  flex-direction: column;
`;

export const Root = styled(Box)<{ verticalPadding?: string }>`
  width: 100%;
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: ${({ verticalPadding }) => (verticalPadding ? `${verticalPadding} 30px` : '20px 30px')};
  * {
    box-sizing: border-box;
  }
  overflow: hidden;
`;
