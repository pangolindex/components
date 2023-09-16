import { Box, Button, DropdownMenu, Hidden, Loader, Text, TextInput } from '@honeycomb-finance/core';
import { usePangolinWeb3, useTranslation } from '@honeycomb-finance/shared';
import { useWalletModalToggle } from '@honeycomb-finance/state-hooks';
import React, { useContext } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Inbox, Search } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { ErrorContainer, LoaderWrapper, MobileGridContainer, PanelWrapper, PoolsWrapper } from './styles';
import { PositionListProps, SortingType } from './types';

const PositionList: React.FC<PositionListProps> = (props) => {
  const { t } = useTranslation();

  const sortOptions: Array<{ label: string; value: string }> = Object.keys(SortingType).map((key) => ({
    label: t(`elixir.sortTypes.${SortingType[key]}`),
    value: SortingType[key],
  }));
  const { account } = usePangolinWeb3();
  const toggleWalletModal = useWalletModalToggle();

  const {
    isLoading,
    menuItems,
    sortBy,
    onChangeSortBy,
    searchQuery,
    handleSearch,
    activeMenu,
    setMenu,
    doesNotPoolExist,
    children,
  } = props;

  const theme = useContext(ThemeContext);

  return (
    <PoolsWrapper>
      {isLoading && (
        <LoaderWrapper>
          <Loader height={'auto'} size={100} />
        </LoaderWrapper>
      )}
      <>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={10}>
            <Box width="100%">
              <TextInput
                placeholder={t('elixir.positionList.searchContent')}
                onChange={handleSearch}
                value={searchQuery}
                id="token-search-input"
                addonAfter={<Search style={{ marginTop: '5px' }} color={theme.text2} size={20} />}
              />
            </Box>
            <Hidden upToSmall={true}>
              <Box ml={10}>
                <DropdownMenu
                  placeHolder={t('common.sortBy')}
                  options={sortOptions}
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
            <Box display={'flex'} justifyContent={'flex-end'}>
              <DropdownMenu
                placeHolder={t('common.sortBy')}
                options={sortOptions}
                defaultValue={sortBy}
                onSelect={(value) => {
                  onChangeSortBy(value as string);
                }}
                isSearchable={false}
              />
            </Box>
          </MobileGridContainer>
        </Box>
        {doesNotPoolExist ? (
          <ErrorContainer>
            {account ? (
              <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                <Inbox size={'121px'} />
                <Text pt={'25px'} pb={'25px'} color="color11" fontSize={[18, 22]} fontWeight={400}>
                  {t('elixir.positionNotFound')}
                </Text>
              </Box>
            ) : (
              <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                <Inbox size={'121px'} />
                <Text pt={'25px'} pb={'25px'} color="color11" fontSize={[22, 26]} fontWeight={400}>
                  {t('elixir.positionNotExist')}
                </Text>
                <Button width={'300px'} variant="primary" onClick={toggleWalletModal}>
                  {t('common.connectWallet')}
                </Button>
              </Box>
            )}
          </ErrorContainer>
        ) : (
          <Scrollbars>
            <PanelWrapper>{children}</PanelWrapper>
          </Scrollbars>
        )}
      </>
    </PoolsWrapper>
  );
};

export default PositionList;
