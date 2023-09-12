import { Box, Text } from '@honeycomb/core';
import styled from 'styled-components';

export const WatchListRoot = styled(Box)`
  width: 100%;
  height: 100%;
  border-radius: 10px;
  padding: 20px;
  background-color: ${({ theme }) => theme.color2};
  display: flex;
  flex-direction: column;
  min-height: 200px;
  min-width: 280px;
  flex-wrap: wrap;
`;
export const DesktopWatchList = styled(Box)`
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`;

export const MobileWatchList = styled.div`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display: block;
`};
`;

export const GridContainer = styled(Box)<{ coinChartVisible?: boolean }>`
  display: grid;
  grid-template-columns: ${({ coinChartVisible }) => (!coinChartVisible ? `100%` : `minmax(auto, 50%) 50%`)};
  grid-gap: 8px;
  flex: 1;
  min-height: 263px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: none;
    grid-template-rows: max-content;
  `};
`;

export const Divider = styled(Box)`
  height: 1px;
  background-color: ${({ theme }) => theme.bg7};
  margin: 10px 0px 10px 0px;
  width: 100%;
`;

export const CoinList = styled(Box)`
  max-height: 200px;
  overflow-y: auto;
`;

// WatchList Row Styles
export const RowWrapper = styled(Box)<{ isSelected: boolean }>`
  padding: 0px 10px;
  display: grid;
  grid-template-columns: 100px minmax(auto, 1fr) max-content;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.text9};
  cursor: ${({ isSelected }) => (isSelected ? 'default' : 'pointer')} !important;
  background-color: ${({ theme, isSelected }) => (isSelected ? theme.color10 : theme.color2)};

  height: 48px;

  &:hover {
    background-color: ${({ theme }) => theme.color10};
  }
`;

export const DeleteButton = styled.button`
  background-image: linear-gradient(to right, rgba(255, 0, 0, 0), ${({ theme }) => theme.bg6});
  background-color: transparent;
  border: 0px;
  color: ${({ theme }) => theme.text1};
  cursor: pointer;
  display: block;
  height: 45px;
  width: 100%;
  position: absolute;
`;

// Coin Chart Styles

export const SelectedCoinInfo = styled(Box)`
  display: grid;
  grid-template-columns: max-content auto max-content;
  grid-gap: 8px;
  align-items: center;
`;

export const TrackIcons = styled(Box)`
  display: grid;
  grid-template-columns: max-content max-content;
  grid-gap: 15px;
  align-items: center;
`;

export const DurationBtns = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled(Text)`
  font-size: 24px;
  font-weight: 500;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 24px
  `};
`;

export const NoDataWrapper = styled(Box)`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  flex: 1;
  flex-wrap: wrap;
  max-width: 400px;
  color: ${({ theme }) => theme.text1};
  margin: auto;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: initial;
    margin-right: auto;
    margin-left: auto;
    flex:0;
  `};
`;
