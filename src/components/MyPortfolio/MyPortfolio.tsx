import { ALL_CHAINS } from '@pangolindex/sdk';
import React, { useContext, useEffect, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Eye, EyeOff, Lock } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { usePangolinWeb3 } from 'src/hooks';
import { PairDataUser, TokenDataUser, useGetChainsBalances, useGetWalletChainTokens } from 'src/state/pportfolio/hooks';
import { Box } from '../Box';
import { Loader } from '../Loader';
import { Text } from '../Text';
import PortfolioRow from './PortfolioRow';
import { Body, Frame, Header, HideButton, Root, SelectedCard } from './styleds';

const MyPortfolio: React.FC = () => {
  const theme = useContext(ThemeContext);
  const { account } = usePangolinWeb3();

  const [availableBalances, setAvailableBalances] = useState<{ chainID: number; balance: number }[]>([]);
  const [showBalances, setShowBalances] = useState(true);
  const [selectChain, setSelectChain] = useState(43114);

  const { data: balance, isLoading } = useGetChainsBalances();
  const { data: chainTokens, isLoading: isLoadingTokens } = useGetWalletChainTokens(selectChain);

  useEffect(() => {
    if (balance) {
      const _availableBalances = balance.chains
        .filter((chain) => chain.balance > 0.01)
        .sort((a, b) => b.balance - a.balance);

      if (_availableBalances.length > 0) {
        setSelectChain(_availableBalances[0].chainID);
      }

      setAvailableBalances(_availableBalances);
    }
  }, [balance]);

  const renderChain = (_chain: { chainID: number; balance: number }, key: number) => {
    const chain = ALL_CHAINS.filter((value) => value.chain_id === _chain.chainID)[0];
    const balance = _chain.balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
    const isSelected = selectChain === _chain.chainID;
    return (
      <SelectedCard key={key} onClick={() => setSelectChain(_chain.chainID)} selected={isSelected}>
        <img width="26px" height="26px" src={chain?.logo} alt={'Chain logo'} />
        <Box height="100%" display="flex" justifyContent="center" flexDirection="column">
          <Text fontSize={12} color="text1">
            {chain.name}
          </Text>
          {showBalances ? (
            <Text fontSize={12} color="text13">
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
      </SelectedCard>
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
          Your Portfolio
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
      </Header>
      <Box width="100%" display="flex" flexGrow={1} justifyContent="center">
        {!account ? (
          <Box height="100%" display="flex" alignItems="center">
            <Text fontSize={20} color="text1" textAlign="center">
              Connect a wallet to see your portfolio
            </Text>
          </Box>
        ) : isLoading || !balance ? (
          <Loader size={100} />
        ) : balance && availableBalances.length == 0 ? (
          <Box height="100%" display="flex" alignItems="center" flexWrap="wrap">
            <Text fontSize={18} color="text1" textAlign="center">
              Not found balances
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
                  <Frame>{availableBalances.map((chain, key) => renderChain(chain, key))}</Frame>
                </Scrollbars>
              </Box>
            </Box>
            <Box width="100%">
              {isLoadingTokens || !chainTokens ? (
                <Loader size={100} />
              ) : chainTokens.length == 0 ? (
                <Text fontSize={18} color="text1" textAlign="center">
                  Not found tokens on this chain
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
