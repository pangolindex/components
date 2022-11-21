import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useTranslation } from 'react-i18next';
import { Box, DropdownMenu, Loader, Text } from 'src/components';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useGetUserLPHook } from 'src/state/pwallet/multiChainsHooks';
import WalletCard from './WalletCard';
import { EmptyProposals, MobileContainer, PageWrapper, PanelWrapper } from './styleds';

interface Props {
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
}

const Wallet: React.FC<Props> = ({ setMenu, activeMenu, menuItems }) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const useGetUserLP = useGetUserLPHook[chainId];

  const { v2IsLoading, allV2PairsWithLiquidity } = useGetUserLP();
  // fetch the user's balances of all tracked V2 LP tokens

  const { t } = useTranslation();

  function getWalletCardView() {
    if (!account) {
      return (
        <Box padding="40px" width="100%" borderRadius="16px">
          <Text color="text3" textAlign="center" fontWeight={500}>
            {t('pool.connectWalletToView')}
          </Text>
        </Box>
      );
    } else if (v2IsLoading) {
      return <Loader size={100} />;
    } else if (allV2PairsWithLiquidity?.length > 0) {
      return (
        <>
          <Scrollbars>
            <PanelWrapper>
              {allV2PairsWithLiquidity.map((v2Pair) => (
                <WalletCard key={v2Pair?.liquidityToken?.address} pair={v2Pair} />
              ))}
            </PanelWrapper>
          </Scrollbars>
        </>
      );
    } else {
      return (
        <EmptyProposals>
          <Text color="text3" textAlign="center" fontWeight={500}>
            {t('pool.noLiquidity')}
          </Text>
        </EmptyProposals>
      );
    }
  }

  return (
    <PageWrapper>
      <MobileContainer>
        <DropdownMenu
          options={menuItems}
          defaultValue={activeMenu}
          onSelect={(value) => {
            setMenu(value as string);
          }}
        />
      </MobileContainer>

      {getWalletCardView()}
    </PageWrapper>
  );
};

export default Wallet;
