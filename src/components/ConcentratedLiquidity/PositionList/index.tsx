import React, { useContext } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Inbox, Search } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, DropdownMenu, Loader, Text, TextInput } from 'src/components';
import { Hidden } from 'src/theme/components';
import { LoaderWrapper, MobileGridContainer, PanelWrapper, PoolsWrapper } from './styles';
import { PositionListProps, SortingType } from './types';

const PositionList: React.FC<PositionListProps> = (props) => {
  const { t } = useTranslation();

  const sortOptions: Array<{ label: string; value: string }> = Object.keys(SortingType).map((key) => ({
    label: t(`concentratedLiquidity.sortTypes.${SortingType[key]}`),
    value: SortingType[key],
  }));

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
                placeholder={t('concentratedLiquidity.positionList.searchContent')}
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
          <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
            <Inbox size={'121px'} />
            <Text pt={'25px'} pb={'25px'} color="color11" fontSize={[18, 22]} fontWeight={400}>
              {t('concentratedLiquidity.positionNotFound')}
            </Text>
          </Box>
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
