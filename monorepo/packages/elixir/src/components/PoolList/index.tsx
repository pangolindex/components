import { Box, Button, DropdownMenu, Hidden, Loader, Text, TextInput } from '@pangolindex/core';
import { Currency, ElixirPool, JSBI } from '@pangolindex/sdk';
import { BIG_INT_ZERO, useDebounce, usePangolinWeb3, useTranslation } from '@pangolindex/shared';
import { useWalletModalToggle } from '@pangolindex/state-hooks';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Inbox, Search } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { useAllPoolsViaSubgraph } from 'src/hooks/evm';
import { PoolState } from 'src/hooks/types';
import { Field } from 'src/state/mint/atom';
import { useMintActionHandlers } from 'src/state/mint/hooks';
import AddLiquidity from '../AddLiquidity';
import PoolCard from './PoolCard';
import { Cards, ErrorContainer, LoaderWrapper, MobileGridContainer, PanelWrapper, PoolsWrapper } from './styles';
import { PoolListProps, SortingType } from './types';

const PoolList: React.FC<PoolListProps> = (props) => {
  const { account } = usePangolinWeb3();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);

  const [addLiquidityIsOpen, setAddLiquidityIsOpen] = useState<boolean>(false);

  const { onCurrencySelection } = useMintActionHandlers(true);

  const { isLoading, allPools: pools } = useAllPoolsViaSubgraph();

  const allPools = useMemo(() => {
    const farms: ElixirPool[] = [];

    for (let index = 0; index < pools.length; index++) {
      const [poolState, pool] = pools[index];

      // if is loading or not exist pair continue
      if (poolState === PoolState.LOADING || !pool) {
        continue;
      }

      farms.push(pool);
    }
    return farms;
  }, [pools]);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value.trim());
  }, []);

  const sort = (pools: ElixirPool[]) => {
    if (sortBy === SortingType.liquidity) {
      const sortedPools = [...pools].sort(function (info_a, info_b) {
        return JSBI.greaterThanOrEqual(info_a?.liquidity, info_b?.liquidity ?? BIG_INT_ZERO) ? -1 : 1;
      });
      return sortedPools;
    } else if (sortBy === SortingType.apr) {
      const sortedPools = [...pools].sort((a, b) => (b?.fee ?? 0) - (a?.fee ?? 0));
      return sortedPools;
    }
  };

  const sortOptions: Array<{ label: string; value: string }> = Object.keys(SortingType).map((key) => ({
    label: t(`elixir.sortTypes.${SortingType[key]}`),
    value: SortingType[key],
  }));

  const toggleWalletModal = useWalletModalToggle();

  const { menuItems, activeMenu, setMenu } = props;

  const theme = useContext(ThemeContext);

  /**
   * It sorts and filters the active menu pools based on the search query and the sorting type
   */
  const finalPools = useMemo(() => {
    let pools: ElixirPool[] = allPools;
    if (searchQuery) {
      pools = allPools.filter((pool) => {
        return (
          (pool?.token0?.symbol || '').toUpperCase().includes(debouncedSearchQuery.toUpperCase()) ||
          (pool?.token1?.symbol || '').toUpperCase().includes(debouncedSearchQuery.toUpperCase())
        );
      });
    }

    if (sortBy) {
      pools = sort(pools) ?? pools;
    }

    return (pools || [])?.filter((item: ElixirPool) => JSBI.greaterThan(item?.liquidity, BIG_INT_ZERO));
  }, [allPools, debouncedSearchQuery, sortBy]);

  const onOpenAddLiquidityModal = useCallback(
    (currency0: Currency, currency1: Currency) => {
      onCurrencySelection(Field.CURRENCY_A, currency0);
      onCurrencySelection(Field.CURRENCY_B, currency1);
      setAddLiquidityIsOpen(!addLiquidityIsOpen);
    },
    [addLiquidityIsOpen],
  );

  const onCloseAddLiquidityModal = useCallback(() => {
    setAddLiquidityIsOpen(!addLiquidityIsOpen);
  }, [addLiquidityIsOpen]);

  return (
    <PoolsWrapper>
      {isLoading ? (
        <LoaderWrapper>
          <Loader height={'auto'} size={100} />
        </LoaderWrapper>
      ) : (
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
                      setSortBy(value as string);
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
                    setSortBy(value as string);
                  }}
                  isSearchable={false}
                />
              </Box>
            </MobileGridContainer>
          </Box>
          {finalPools?.length === 0 ? (
            <ErrorContainer>
              <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                <Inbox size={'121px'} />
                <Text pt={'25px'} pb={'25px'} color="color11" fontSize={[22, 26]} fontWeight={400}>
                  {t('common.notFound')}
                </Text>
                {!account && (
                  <Button width={'300px'} variant="primary" onClick={toggleWalletModal}>
                    {t('common.connectWallet')}
                  </Button>
                )}
              </Box>
            </ErrorContainer>
          ) : (
            <Scrollbars>
              <PanelWrapper>
                {' '}
                <Cards>
                  {finalPools.map((pool, i) => (
                    <PoolCard key={i} pool={pool} onClick={onOpenAddLiquidityModal} />
                  ))}
                </Cards>
              </PanelWrapper>
            </Scrollbars>
          )}
        </>
      )}
      {addLiquidityIsOpen && <AddLiquidity isOpen={addLiquidityIsOpen} onClose={onCloseAddLiquidityModal} />}
    </PoolsWrapper>
  );
};

export default PoolList;
