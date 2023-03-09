import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '../Box';
import PositionCard from './PositionCard';
import PositionList from './PositionList';
import Sidebar from './Sidebar';
import { MenuType } from './Sidebar/types';
import { Cards, GridContainer, PageWrapper } from './styles';

const ConcentratedLiquidity = () => {
  const { t } = useTranslation();

  // ------------------ MOCK DATA ------------------
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

  return (
    <PageWrapper>
      <GridContainer>
        <Box display="flex" position={'relative'} height="100%">
          <Sidebar activeMenu={activeMenu} setMenu={handleSetMenu} menuItems={menuItems} />
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
              <PositionCard currency0={currency0} currency1={currency1} />
              <PositionCard currency0={currency0} currency1={currency1} />
              <PositionCard currency0={currency0} currency1={currency1} />
              <PositionCard currency0={currency0} currency1={currency1} />
              <PositionCard currency0={currency0} currency1={currency1} />
              <PositionCard currency0={currency0} currency1={currency1} />
            </Cards>
          </PositionList>
        </Box>
      </GridContainer>
    </PageWrapper>
  );
};
export default ConcentratedLiquidity;
