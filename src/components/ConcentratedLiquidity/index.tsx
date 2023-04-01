import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { BigNumber } from 'ethers';
import React, { useCallback, useMemo, useState } from 'react';
import { Inbox } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { BIG_INT_ZERO, Box, Button, Loader, Text, useDebounce, useWalletModalToggle } from 'src';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useGetUserPositionsHook } from 'src/state/pwallet/concentratedLiquidity/hooks';
import { PositionDetails } from 'src/state/pwallet/concentratedLiquidity/types';
import { Visible } from 'src/theme/components';
import AddLiquidity from './AddLiquidity';
import DetailModal from './DetailModal';
import PositionCard from './PositionCard';
import PositionList from './PositionList';
import { SortingType } from './PositionList/types';
import Sidebar from './Sidebar';
import { MenuType } from './Sidebar/types';
import { Cards, Content, ErrorContainer, GridContainer, MobileHeader, PageWrapper } from './styles';

const ConcentratedLiquidity = () => {
  const { t } = useTranslation();
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const useGetUserPositions = useGetUserPositionsHook[chainId];
  const toggleWalletModal = useWalletModalToggle();
  const { loading: positionsLoading } = useGetUserPositions(); // TODO: positions
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const [activeMenu, setMenu] = useState<string>(MenuType.allPositions);
  const [detailModalIsOpen, setDetailModalIsOpen] = useState<boolean>(false);
  const [addLiquidityIsOpen, setAddLiquidityIsOpen] = useState<boolean>(false);
  const menuItems: Array<{ label: string; value: string }> = Object.keys(MenuType).map((key) => ({
    label: t(`concentratedLiquidity.menuTypes.${MenuType[key]}`),
    value: MenuType[key],
  }));

  // ------------------ MOCK DATA ------------------
  const currency0 = new Token(ChainId.AVALANCHE, '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', 6, 'USDC', 'USD Coin');
  const currency2 = new Token(ChainId.AVALANCHE, '0x0000000000000000000000000000000000000000', 18, 'AVAX', 'AVAX');
  const currency1 = new Token(
    ChainId.AVALANCHE,
    CHAINS[ChainId.AVALANCHE].contracts!.png,
    18,
    CHAINS[ChainId.AVALANCHE].png_symbol!,
    'Pangolin',
  );
  const positions: PositionDetails[] = [
    {
      tokenId: BigNumber.from('53808'),
      token0: currency1,
      token1: currency2,
      apr: 500,
      liquidity: BigNumber.from('0'),
    },
    {
      tokenId: BigNumber.from('73807'),
      token0: currency0,
      token1: currency2,
      apr: 200,
      liquidity: BigNumber.from('10000000000000000000'),
    },
    {
      tokenId: BigNumber.from('33807'),
      token0: currency0,
      token1: currency1,
      apr: 100,
      liquidity: BigNumber.from('10000000000000000000'),
    },
    {
      tokenId: BigNumber.from('53858'),
      token0: currency1,
      token1: currency0,
      apr: 700,
      liquidity: BigNumber.from('0'),
    },
  ];
  // -----------------------------------------------

  const handleSearch = useCallback((value) => {
    setSearchQuery(value.trim());
  }, []);

  const sort = (positions: PositionDetails[]) => {
    if (sortBy === SortingType.liquidity) {
      const sortedPositions = [...positions].sort(function (info_a, info_b) {
        return info_a?.liquidity?.gte(info_b?.liquidity ?? BIG_INT_ZERO) ? -1 : 1;
      });
      return sortedPositions;
    } else if (sortBy === SortingType.apr) {
      const sortedPositions = [...positions].sort((a, b) => (b?.apr ?? 0) - (a?.apr ?? 0));
      return sortedPositions;
    }
  };

  const [openPositions, closedPositions] = positions?.reduce<[PositionDetails[], PositionDetails[]]>(
    (acc, p) => {
      acc[p.liquidity?.isZero() ? 1 : 0].push(p);
      return acc;
    },
    [[], []],
  ) ?? [[], []];

  /**
   * It filters positions based on the active menu
   */
  const filteredPositions = useMemo(() => {
    if (activeMenu === MenuType.allPositions) {
      return [...openPositions, ...closedPositions];
    } else if (activeMenu === MenuType.openPositions) {
      return openPositions;
    } else {
      return closedPositions;
    }
  }, [activeMenu, closedPositions, openPositions]);

  /**
   * It sorts and filters the active menu positions based on the search query and the sorting type
   */
  const finalPositions = useMemo(() => {
    let positions = filteredPositions;
    if (searchQuery) {
      positions = filteredPositions.filter((position) => {
        return (
          (position?.token0?.symbol || '').toUpperCase().includes(debouncedSearchQuery.toUpperCase()) ||
          (position?.token1?.symbol || '').toUpperCase().includes(debouncedSearchQuery.toUpperCase())
        );
      });
    }

    if (sortBy) {
      positions = sort(positions) ?? positions;
    }

    return positions;
  }, [filteredPositions, debouncedSearchQuery, sortBy]);

  const handleSetMenu = useCallback(
    (value: string) => {
      setMenu(value);
    },
    [setMenu],
  );

  const onChangeDetailModalStatus = useCallback(() => {
    setDetailModalIsOpen(!detailModalIsOpen);
  }, [detailModalIsOpen]);

  const onChangeAddLiquidityStatus = useCallback(() => {
    setAddLiquidityIsOpen(!addLiquidityIsOpen);
  }, [addLiquidityIsOpen]);

  return (
    <PageWrapper>
      <GridContainer>
        <Box display="flex" position={'relative'} height="100%">
          <Sidebar
            changeAddLiquidityModalStatus={onChangeAddLiquidityStatus}
            activeMenu={activeMenu}
            setMenu={handleSetMenu}
            menuItems={menuItems}
          />
          <Content>
            <Visible upToSmall>
              <MobileHeader>
                <Text color="color11" fontSize={[32, 28]} fontWeight={500}>
                  {t('concentratedLiquidity.sidebar.title')}
                </Text>
                <Button onClick={onChangeAddLiquidityStatus} padding="4px 6px" variant="primary">
                  {t('common.addLiquidity')}
                </Button>
              </MobileHeader>
            </Visible>
            {positionsLoading ? (
              <Loader height={'auto'} size={100} />
            ) : filteredPositions && filteredPositions.length > 0 ? (
              <PositionList
                setMenu={handleSetMenu}
                activeMenu={activeMenu}
                menuItems={menuItems}
                handleSearch={handleSearch}
                onChangeSortBy={setSortBy}
                sortBy={sortBy}
                searchQuery={searchQuery}
                isLoading={false} // TODO:
                doesNotPoolExist={finalPositions?.length === 0}
              >
                <Cards>
                  {finalPositions.map((position) => (
                    <PositionCard
                      key={position.tokenId.toString()}
                      currency0={position.token0}
                      currency1={position.token1}
                      onClick={onChangeDetailModalStatus}
                    />
                  ))}
                </Cards>
              </PositionList>
            ) : (
              <ErrorContainer>
                {account && finalPositions && finalPositions.length === 0 && (
                  <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                    <Inbox size={'121px'} />
                    <Text pt={'25px'} pb={'25px'} color="color11" fontSize={[18, 22]} fontWeight={400}>
                      {t('concentratedLiquidity.positionNotFound')}
                    </Text>
                  </Box>
                )}
                {!account && (
                  <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                    <Inbox size={'121px'} />
                    <Text pt={'25px'} pb={'25px'} color="color11" fontSize={[22, 26]} fontWeight={400}>
                      {t('concentratedLiquidity.positionNotExist')}
                    </Text>
                    <Button width={'300px'} variant="primary" onClick={toggleWalletModal}>
                      {t('common.connectWallet')}
                    </Button>
                  </Box>
                )}
              </ErrorContainer>
            )}
          </Content>
        </Box>
      </GridContainer>
      <DetailModal
        currency0={currency0}
        currency1={currency1}
        isOpen={detailModalIsOpen}
        onClose={onChangeDetailModalStatus}
      />
      <AddLiquidity
        isOpen={addLiquidityIsOpen}
        onClose={onChangeAddLiquidityStatus}
        currency0={currency0}
        currency1={currency1}
      />
    </PageWrapper>
  );
};
export default ConcentratedLiquidity;
