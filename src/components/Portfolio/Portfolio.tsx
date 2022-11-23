import { ALL_CHAINS, Chain } from '@pangolindex/sdk';
import React, { useCallback, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { usePangolinWeb3 } from 'src/hooks';
import { useGetChainsBalances } from 'src/state/pportfolio/hooks';
import { useShowBalancesManager } from 'src/state/puser/hooks';
import { Box } from '../Box';
import { Loader } from '../Loader';
import { Text } from '../Text';
import ToggleBalanceButton from './ToggleBalanceButton';
import { ChainCard, Frame, PortfolioHeader, PortfolioRoot } from './styleds';

const Portfolio: React.FC = () => {
  const { account } = usePangolinWeb3();
  const { data: balances, isRefetching, isLoading } = useGetChainsBalances();
  const [showUserBalances, setUserShowBalances] = useShowBalancesManager();
  const [showBalances, setShowBalances] = useState(showUserBalances);

  const handleShowBalances = useCallback(() => {
    setUserShowBalances(!showBalances);
    setShowBalances(!showBalances);
  }, [showBalances]);

  const renderChain = (chain: Chain, balance: number, key: number) => {
    const balanceFormatted = balance.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    return (
      <ChainCard key={key}>
        <img width="48px" height="48px" src={chain?.logo} alt={'Chain logo'} />
        <Box height="100%" display="flex" justifyContent="center" flexDirection="column">
          <Text fontSize={14} color="text1">
            {chain.name}
          </Text>
          {showBalances ? (
            <Text fontSize={14} color="text13">
              ${balanceFormatted}
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
      </ChainCard>
    );
  };

  const renderTotalBalance = () => {
    if (showBalances) {
      return (
        <Text fontSize={18} color="text1" fontWeight={600}>
          $
          {balances
            ? balances.total.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
            : 0}
        </Text>
      );
    }
    return (
      <Text color="text13" fontSize={18} fontWeight={700}>
        *
      </Text>
    );
  };

  return (
    <PortfolioRoot>
      <PortfolioHeader>
        <Text fontSize={['16px', '16px', '24px']} color="text1" fontWeight={600} style={{ flexGrow: 1 }}>
          Portfolio Value in All Chains
        </Text>
        <ToggleBalanceButton showBalances={showBalances} handleShowBalances={handleShowBalances} />
      </PortfolioHeader>
      <Box display="flex" flexGrow={1} width="100%" alignItems="center" justifyContent="center" flexDirection="column">
        {!account ? (
          <Text fontSize={20} color="text1" textAlign="center">
            Connect a wallet to see your Portfolio
          </Text>
        ) : isRefetching || isLoading || !balances ? (
          <Loader size={100} />
        ) : (
          <>
            <Box
              padding={10}
              borderRadius={4}
              display="flex"
              marginBottom={15}
              alignItems="center"
              bgColor="bg6"
              flexWrap="wrap"
              width="100%"
              style={{ boxSizing: 'border-box' }}
            >
              <Text fontSize={18} color="text1" style={{ flexGrow: 1, minWidth: '200px' }}>
                Total Amount Invested
              </Text>
              {renderTotalBalance()}
            </Box>
            <Box width="100%" minHeight="140px">
              {Object.values(balances.chains).length > 0 ? (
                <Scrollbars style={{ width: '100%', height: '100%', minHeight: '140px' }}>
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
              ) : (
                <Text fontSize={18} color="text1" textAlign="center">
                  Not found balances
                </Text>
              )}
            </Box>
          </>
        )}
      </Box>
    </PortfolioRoot>
  );
};

export default Portfolio;
