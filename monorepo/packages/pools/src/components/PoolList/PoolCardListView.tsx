import { Box, DropdownMenu, Hidden, Loader, TextInput } from '@honeycomb/core';
import { useTranslation } from '@honeycomb/shared';
import React, { useContext } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Search } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { DoubleSideStakingInfo } from 'src/hooks/minichef/types';
import DetailModal from '../DetailModal';
import { LoadingWrapper, MobileGridContainer, PanelWrapper, PoolsWrapper } from './styleds';

export enum SortingType {
  totalStakedInUsd = 'totalStakedInUsd',
  totalApr = 'totalApr',
}

export const SortOptions = [
  {
    label: 'Liquidity',
    value: SortingType.totalStakedInUsd,
  },
  {
    label: 'APR',
    value: SortingType.totalApr,
  },
];

export interface PoolCardListViewProps {
  version: string;
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
  handleSearch: (value: any) => void;
  onChangeSortBy: (value: string) => void;
  sortBy: string;
  searchQuery: string;
  isLoading: boolean;
  doesNotPoolExist: boolean;
  children: React.ReactNode;
  selectedPool: DoubleSideStakingInfo;
  notFoundPools: boolean;
}

const PoolCardListView = ({
  version,
  setMenu,
  activeMenu,
  menuItems,
  handleSearch,
  sortBy,
  searchQuery,
  onChangeSortBy,
  isLoading,
  doesNotPoolExist,
  notFoundPools,
  children,
  selectedPool,
}: PoolCardListViewProps) => {
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);

  const renderPoolCardListView = () => {
    if (doesNotPoolExist) {
      return (
        <Box textAlign="center" color="color4">
          {t('earnPage.noActiveRewards')}
        </Box>
      );
    } else if (isLoading && !searchQuery) {
      return (
        <LoadingWrapper>
          <Loader size={100} />
        </LoadingWrapper>
      );
    } else {
      return (
        <>
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={10}>
              <Box width="100%">
                <TextInput
                  placeholder={t('searchModal.tokenName')}
                  onChange={handleSearch}
                  value={searchQuery}
                  id="token-search-input"
                  addonAfter={<Search style={{ marginTop: '5px' }} color={theme.text2} size={20} />}
                />
              </Box>
              <Hidden upToSmall={true}>
                <Box ml={10}>
                  <DropdownMenu
                    placeHolder={`${t('sarPortfolio.sortBy')}:`}
                    options={SortOptions}
                    defaultValue={sortBy}
                    onSelect={(value) => {
                      onChangeSortBy(value as string);
                    }}
                    height="54px"
                  />
                </Box>
              </Hidden>
            </Box>
            <MobileGridContainer>
              <DropdownMenu
                options={menuItems}
                defaultValue={activeMenu}
                onSelect={(value) => {
                  setMenu(value as string);
                }}
              />
              <DropdownMenu
                placeHolder={`${t('sarPortfolio.sortBy')}:`}
                options={SortOptions}
                defaultValue={sortBy}
                onSelect={(value) => {
                  onChangeSortBy(value as string);
                }}
                isSearchable={false}
              />
            </MobileGridContainer>
          </Box>
          {searchQuery && notFoundPools ? (
            <Box textAlign="center" color="color4">
              {t('pool.noFarms')}
            </Box>
          ) : (
            <Scrollbars>
              <PanelWrapper>{children}</PanelWrapper>
            </Scrollbars>
          )}
        </>
      );
    }
  };

  return (
    <PoolsWrapper>
      {renderPoolCardListView()}
      <DetailModal stakingInfo={selectedPool} version={Number(version)} />
    </PoolsWrapper>
  );
};

export default PoolCardListView;
