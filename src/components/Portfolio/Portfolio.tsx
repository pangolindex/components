import { ALL_CHAINS } from '@pangolindex/sdk';
import React, { useContext, useEffect, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Eye, EyeOff, Info, Lock } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { usePangolinWeb3 } from 'src/hooks';
import { useGetChainsBalances } from 'src/state/pportfolio/hooks';
import { Box } from '../Box';
import { Loader } from '../Loader';
import { Text } from '../Text';
import { ChainCard, Frame, HideButton, PortfolioFooter, PortfolioHeader, PortfolioRoot } from './styleds';

const Portfolio: React.FC = () => {
  const theme = useContext(ThemeContext);
  const { account } = usePangolinWeb3();
  const { data: balance, isRefetching, isLoading } = useGetChainsBalances();
  const [availableBalances, setAvailableBalances] = useState<{ chainID: number; balance: number }[]>([]);
  const [showBalances, setShowBalances] = useState(true);

  useEffect(() => {
    if (balance) {
      const _availableBalances = balance.chains
        .filter((chain) => chain.balance > 0.01)
        .sort((a, b) => b.balance - a.balance);
      setAvailableBalances(_availableBalances);
    }
  }, [balance]);

  const renderChain = (_chain: { chainID: number; balance: number }, key: number) => {
    const chain = ALL_CHAINS.filter((value) => value.chain_id === _chain.chainID)[0];
    const balance = _chain.balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return (
      <ChainCard key={key}>
        <img width={'55px'} height="55px" src={chain?.logo} alt={'Chain logo'} />
        <Box height="100%" display="flex" justifyContent="center" flexDirection="column">
          <Text fontSize={14} color="text1">
            {chain.name}
          </Text>
          {showBalances ? (
            <Text fontSize={14} color="text13">
              ${balance}
            </Text>
          ) : (
            <Box display="flex" flexDirection="row">
              {[...Array(4)].map((_value, key) => (
                <Lock color={theme.text13} size={18} key={key} />
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
          ${balance ? balance.total.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0}
        </Text>
      );
    }
    return <Lock color={theme.text1} size={18} />;
  };

  return (
    <PortfolioRoot>
      <PortfolioHeader>
        <Text fontSize={['16px', '16px', '24px']} color="text1" fontWeight={600} style={{ flexGrow: 1 }}>
          Portfolio Value in All Chains
        </Text>
        <HideButton onClick={() => setShowBalances(!showBalances)}>
          {showBalances ? (
            <>
              <EyeOff size={12} id="portfolio-icon" />
              <Text fontSize={['8px', '10px', '12px']} id="portfolio-text" style={{ marginLeft: '5px' }}>
                Hide Your Balance
              </Text>
            </>
          ) : (
            <>
              <Eye size={12} id="portfolio-icon" />
              <Text fontSize={12} id="portfolio-text" style={{ marginLeft: '5px' }}>
                Show Your Balance
              </Text>
            </>
          )}
        </HideButton>
      </PortfolioHeader>
      <Box display="flex" flexGrow={1} width="100%" alignItems="center" justifyContent="center" flexDirection="column">
        {!account ? (
          <Text fontSize={20} color="text1" textAlign="center">
            Connect a wallet to see your Portfolio
          </Text>
        ) : isRefetching || isLoading || !balance ? (
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
            >
              <Text fontSize={18} color="text1" style={{ flexGrow: 1, minWidth: '200px' }}>
                Total Amount Invested
              </Text>
              {renderTotalBalance()}
            </Box>
            <Box width="100%" minHeight="100px" maxHeight="200px">
              {availableBalances.length > 0 ? (
                <Scrollbars style={{ width: '100%', height: '100%' }}>
                  <Frame>{availableBalances.map((chain, key) => renderChain(chain, key))}</Frame>
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
      <PortfolioFooter>
        <Info size={12} />
        <Text fontSize={12} textAlign="center">
          Includes coins, pools and other holdings in your current wallet
        </Text>
      </PortfolioFooter>
    </PortfolioRoot>
  );
};

export default Portfolio;
