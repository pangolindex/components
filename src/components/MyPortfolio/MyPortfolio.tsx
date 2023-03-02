import { ALL_CHAINS, CHAINS, Chain } from '@pangolindex/sdk';
import React, { useCallback, useEffect, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useTranslation } from 'react-i18next';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { PairDataUser, TokenDataUser, useGetChainsBalances, useGetWalletChainTokens } from 'src/state/pportfolio/hooks';
import { useShowBalancesManager } from 'src/state/puser/hooks';
import { Box } from '../Box';
import { Loader } from '../Loader';
import ToggleBalanceButton from '../Portfolio/ToggleBalanceButton';
import { Text } from '../Text';
import PortfolioRow from './PortfolioRow';
import { Body, Frame, Header, Root, SelectedCard } from './styleds';

const MyPortfolio: React.FC = () => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { t } = useTranslation();
  const [showBalances, setShowBalances] = useShowBalancesManager();
  const [selectChain, setSelectChain] = useState(43114);

  const { data: balances, isLoading } = useGetChainsBalances();
  const { data: chainTokens, isLoading: isLoadingTokens } = useGetWalletChainTokens(selectChain);

  const mixpanel = useMixpanel();

  useEffect(() => {
    if (balances) {
      if (Object.keys(balances).length > 0) {
        // if chainId in balances.chains then selectChain = chainId
        const _chain = Object.keys(balances).find(
          (chainID) => chainID.toLowerCase() === CHAINS[chainId].symbol.toLowerCase(),
        );
        // find in ALL_CHAINS the chainid of first chain key in balances, if doesn't exist put avalance
        const firstChainId =
          ALL_CHAINS.find((chain) => chain.symbol.toLowerCase() === Object.keys(balances)[0].toLowerCase())?.chain_id ??
          43114;
        setSelectChain(_chain ? chainId : firstChainId);
      }
    }
  }, [balances]);

  const handleShowBalances = useCallback(() => {
    setShowBalances(!showBalances);
    mixpanel.track(!showBalances ? MixPanelEvents.HIDE_BALANCES : MixPanelEvents.SHOW_BALANCES, {
      widget: 'portfolio',
    });
  }, [showBalances]);

  const renderChain = (chain: Chain, balance: number, key: number) => {
    const balanceFormmated = balance.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    const isSelected = selectChain === chain.chain_id;
    return (
      <SelectedCard key={key} onClick={() => setSelectChain(chain.chain_id ?? 43114)} selected={isSelected}>
        <img width="26px" height="26px" src={chain?.logo} alt={'Chain logo'} />
        <Box height="100%" display="flex" justifyContent="center" flexDirection="column">
          <Text fontSize={12} color="text1">
            {chain.name}
          </Text>
          {showBalances ? (
            <Text fontSize={12} color="text13">
              ${balanceFormmated}
            </Text>
          ) : (
            <Box display="flex" flexDirection="row">
              {[...Array(4)].map((_value, _key) => (
                <Text color="text13" fontSize={14} fontWeight={700} key={_key}>
                  *
                </Text>
              ))}
            </Box>
          )}
        </Box>
      </SelectedCard>
    );
  };

  const renderTotalBalance = () => {
    if (showBalances) {
      return (
        <Text fontSize={16} color="text1" fontWeight={600}>
          $
          {balances
            ? balances.total.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
            : 0}
        </Text>
      );
    }
    return (
      <Text color="text13" fontSize={14} fontWeight={700}>
        *
      </Text>
    );
  };

  const renderRow = (item: TokenDataUser | PairDataUser, index: number) => {
    return (
      <PortfolioRow
        coin={item instanceof TokenDataUser ? item : undefined}
        pair={item instanceof PairDataUser ? item : undefined}
        key={index}
        showBalances={showBalances}
      />
    );
  };

  return (
    <Root>
      <Header>
        <Text fontSize={['16px', '16px', '24px']} color="text1" fontWeight={600} style={{ flexGrow: 1 }}>
          {t('swapPage.yourPortFolio')}
        </Text>
        <ToggleBalanceButton showBalances={showBalances} handleShowBalances={handleShowBalances} />
      </Header>
      <Box width="100%" display="flex" flexGrow={1} justifyContent="center">
        {!account ? (
          <Box height="100%" display="flex" alignItems="center">
            <Text fontSize={20} color="text1" textAlign="center">
              {t('swapPage.connectWalletViewPortFolio')}
            </Text>
          </Box>
        ) : isLoading || !balances ? (
          <Loader size={100} />
        ) : balances && balances.chains.length == 0 ? (
          <Box height="100%" display="flex" alignItems="center" flexWrap="wrap">
            <Text fontSize={18} color="text1" textAlign="center">
              {t('portfolio.balanceNotFound')}
            </Text>
          </Box>
        ) : (
          <Body>
            <Box display="flex" flexDirection="column" width="100%">
              <Box
                padding={10}
                borderRadius={4}
                display="flex"
                marginBottom={15}
                alignItems="center"
                bgColor="bg6"
                flexWrap="wrap"
              >
                <Text fontSize={18} color="text1" style={{ flexGrow: 1, minWidth: '200px' }}>
                  Total:
                </Text>
                {renderTotalBalance()}
              </Box>
              <Box width="100%" height="100%" minHeight="128px">
                <Scrollbars style={{ width: '100%', height: '100%' }}>
                  <Frame>
                    {Object.keys(balances.chains).map((chainID, key) => {
                      const chain = ALL_CHAINS.find((value) => value.symbol.toLowerCase() == chainID.toLowerCase());
                      const balance = balances.chains[chainID] as number; // if exist chain key exist balance

                      if (chain) {
                        return renderChain(chain, balance, key);
                      }
                      return null;
                    })}
                  </Frame>
                </Scrollbars>
              </Box>
            </Box>
            <Box width="100%">
              {isLoadingTokens ? (
                <Loader size={100} />
              ) : !chainTokens || chainTokens.length == 0 ? (
                <Text fontSize={18} color="text1" textAlign="center">
                  {t('swapPage.notFoundToken')}
                </Text>
              ) : (
                <Box height="100%" minHeight="128px">
                  <Scrollbars style={{ width: '100%', height: '100%' }}>
                    {chainTokens.map((item, index) => renderRow(item, index))}
                  </Scrollbars>
                </Box>
              )}
            </Box>
          </Body>
        )}
      </Box>
    </Root>
  );
};

export default MyPortfolio;
