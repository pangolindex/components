import { ALL_CHAINS } from '@pangolindex/sdk';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Lock } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { PairDataUser, TokenDataUser, useGetChainsBalances, useGetWalletChainTokens } from 'src/state/pportfolio/hooks';
import { Box } from '../Box';
import { Loader } from '../Loader';
import ToggleBalanceButton from '../Portfolio/ToggleBalanceButton';
import { Text } from '../Text';
import PortfolioRow from './PortfolioRow';
import { Body, Frame, Header, Root, SelectedCard } from './styleds';

const MyPortfolio: React.FC = () => {
  const theme = useContext(ThemeContext);
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const [showBalances, setShowBalances] = useState(true);
  const [selectChain, setSelectChain] = useState(43114);

  const { data: balances, isLoading } = useGetChainsBalances();
  const { data: chainTokens, isLoading: isLoadingTokens } = useGetWalletChainTokens(selectChain);

  useEffect(() => {
    if (balances) {
      if (balances.chains.length > 0) {
        // if chainId in balances.chains then selectChain = chainId
        const _chain = balances.chains.find((chain) => chain.chainID === chainId);
        setSelectChain(_chain ? chainId : balances.chains[0].chainID);
      }
    }
  }, [balances]);

  const handleShowBalances = useCallback(() => {
    setShowBalances(!showBalances);
  }, [showBalances]);

  const renderChain = (_chain: { chainID: number; balance: number }, key: number) => {
    const chain = ALL_CHAINS.filter((value) => value.chain_id === _chain.chainID)[0];
    const balance = _chain.balance.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
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
              {[...Array(4)].map((_value, _key) => (
                <Lock color={theme.text13} size={14} key={_key} />
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
        <ToggleBalanceButton showBalances={showBalances} handleShowBalances={handleShowBalances} />
      </Header>
      <Box width="100%" display="flex" flexGrow={1} justifyContent="center">
        {!account ? (
          <Box height="100%" display="flex" alignItems="center">
            <Text fontSize={20} color="text1" textAlign="center">
              Connect a wallet to see your portfolio
            </Text>
          </Box>
        ) : isLoading || !balances ? (
          <Loader size={100} />
        ) : balances && balances.chains.length == 0 ? (
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
                  <Frame>{balances.chains.map((chain, key) => renderChain(chain, key))}</Frame>
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
