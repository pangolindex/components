import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useTranslation } from 'react-i18next';
import { Box, DropdownMenu, Loader, Text } from 'src/components';
import { usePangolinWeb3 } from 'src/hooks';
import { useGetUserLP } from 'src/state/pmigrate/hooks';
import WalletCard from './WalletCard';
import { EmptyProposals, MobileContainer, PageWrapper, PanelWrapper } from './styleds';

interface Props {
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
}

const Wallet: React.FC<Props> = ({ setMenu, activeMenu, menuItems }) => {
  const { account } = usePangolinWeb3();
  const { v2IsLoading, allV2PairsWithLiquidity } = useGetUserLP();
  // fetch the user's balances of all tracked V2 LP tokens

  const { t } = useTranslation();

  return (
    <PageWrapper>
      <MobileContainer>
        <DropdownMenu
          options={menuItems}
          value={activeMenu}
          onSelect={(value) => {
            setMenu(value);
          }}
        />
      </MobileContainer>

      {!account ? (
        <Box padding="40px" width="100%" borderRadius="16px">
          <Text color="text3" textAlign="center" fontWeight={500}>
            {t('pool.connectWalletToView')}
          </Text>
        </Box>
      ) : v2IsLoading ? (
        <Loader size={100} />
      ) : allV2PairsWithLiquidity?.length > 0 ? (
        <>
          <Scrollbars>
            <PanelWrapper>
              {allV2PairsWithLiquidity.map((v2Pair) => (
                <WalletCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
              ))}
            </PanelWrapper>
          </Scrollbars>
        </>
      ) : (
        <EmptyProposals>
          <Text color="text3" textAlign="center" fontWeight={500}>
            {t('pool.noLiquidity')}
          </Text>
        </EmptyProposals>
      )}
    </PageWrapper>
  );
};

export default Wallet;
