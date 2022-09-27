import React, { useContext } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Search } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, DropdownMenu, Loader, TextInput } from 'src/components';
import { StakingInfo } from 'src/state/pstake/types';
import { Hidden } from 'src/theme/components';
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
  selectedPool: StakingInfo;
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
  children,
  selectedPool,
}: PoolCardListViewProps) => {
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);

  const renderPoolCardListView = () => {
    if (isLoading && !searchQuery)
      return (
        <LoadingWrapper>
          <Loader size={100} />
        </LoadingWrapper>
      );
    else if (doesNotPoolExist && !searchQuery) {
      return (
        <Box textAlign="center" color="color4">
          {t('earnPage.noActiveRewards')}
        </Box>
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
                    placeHolder="Sort by:"
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
                placeHolder="Sort by:"
                options={SortOptions}
                defaultValue={sortBy}
                onSelect={(value) => {
                  onChangeSortBy(value as string);
                }}
              />
            </MobileGridContainer>
          </Box>
          {doesNotPoolExist && searchQuery ? (
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
