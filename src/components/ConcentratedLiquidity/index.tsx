import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Text } from 'src';
import { useChainId } from 'src/hooks';
import { useGetUserPositionsHook } from 'src/state/pwallet/concentratedLiquidity/hooks';
import { Visible } from 'src/theme/components';
import AddLiquidity from './AddLiquidity';
import DetailModal from './DetailModal';
import PositionCard from './PositionCard';
import PositionList from './PositionList';
import Sidebar from './Sidebar';
import { MenuType } from './Sidebar/types';
import { Cards, Content, GridContainer, MobileHeader, PageWrapper } from './styles';

const ConcentratedLiquidity = () => {
  const { t } = useTranslation();
  const chainId = useChainId();
  const useGetUserPositions = useGetUserPositionsHook[chainId];
  const { positions, loading } = useGetUserPositions();
  // ------------------ MOCK DATA ------------------
  console.log('positions: ', positions, ' loading: ', loading); // TODO:
  const currency0 = new Token(ChainId.AVALANCHE, '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', 6, 'USDC', 'USD Coin');
  const currency1 = new Token(
    ChainId.AVALANCHE,
    CHAINS[ChainId.AVALANCHE].contracts!.png,
    18,
    CHAINS[ChainId.AVALANCHE].png_symbol!,
    'Pangolin',
  );
  // -----------------------------------------------

  const [activeMenu, setMenu] = useState<string>(MenuType.allPositions);
  const [detailModalIsOpen, setDetailModalIsOpen] = useState<boolean>(false);
  const [addLiquidityIsOpen, setAddLiquidityIsOpen] = useState<boolean>(false);
  const menuItems: Array<{ label: string; value: string }> = Object.keys(MenuType).map((key) => ({
    label: t(`concentratedLiquidity.menuTypes.${MenuType[key]}`),
    value: MenuType[key],
  }));

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
            <PositionList
              setMenu={handleSetMenu}
              activeMenu={activeMenu}
              menuItems={menuItems}
              handleSearch={function (value: any): void {
                console.log(value, 'Function not implemented.');
              }}
              onChangeSortBy={function (value: string): void {
                console.log(value, 'Function not implemented.');
              }}
              sortBy={''}
              searchQuery={''}
              isLoading={false}
              doesNotPoolExist={false}
            >
              <Cards>
                <PositionCard currency0={currency0} currency1={currency1} onClick={onChangeDetailModalStatus} />
                <PositionCard currency0={currency0} currency1={currency1} onClick={onChangeDetailModalStatus} />
                <PositionCard currency0={currency0} currency1={currency1} onClick={onChangeDetailModalStatus} />
                <PositionCard currency0={currency0} currency1={currency1} onClick={onChangeDetailModalStatus} />
                <PositionCard currency0={currency0} currency1={currency1} onClick={onChangeDetailModalStatus} />
                <PositionCard currency0={currency0} currency1={currency1} onClick={onChangeDetailModalStatus} />
              </Cards>
            </PositionList>
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
