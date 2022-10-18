import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Loader, Text } from 'src/components';
import { useChainId } from 'src/hooks';
import { useBridgeActionHandlers, useDerivedBridgeInfo } from 'src/state/pbridge/hooks';
import { Tab, TabList, TabPanel, Tabs } from '../Tabs';
import BridgeCard from './BridgeCard';
import BridgeRoute from './BridgeRoute';
import BridgeTransfer from './BridgeTransfer';
import { BridgeState } from './BridgeTransfer/types';
import { CustomTabPanel, LoaderWrapper, PageWrapper, Routes, Transactions, Transfers } from './styles';

const Bridge = () => {
  const chainId = useChainId();
  const { routes, routesLoaderStatus } = useDerivedBridgeInfo();
  const { onSelectRoute } = useBridgeActionHandlers(chainId);
  const [tabIndex, setTabIndex] = useState(0);
  const { t } = useTranslation();

  const currency0 = new Token(
    ChainId.AVALANCHE,
    CHAINS[ChainId.AVALANCHE].contracts!.png,
    18,
    CHAINS[ChainId.AVALANCHE].png_symbol!,
    'Pangolin',
  );
  const currency1 = new Token(
    ChainId.AVALANCHE,
    CHAINS[ChainId.AVALANCHE].contracts!.png,
    18,
    CHAINS[ChainId.AVALANCHE].png_symbol!,
    'Pangolin',
  );

  return (
    <PageWrapper>
      <BridgeCard />
      <Transactions>
        <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
          <TabList>
            <Tab>{t('bridge.availableRoutes', { number: routes?.length || 0 })}</Tab>
            <Tab>{t('bridge.activeTransfers', { number: 0 })}</Tab>
            <Tab disabled>{t('bridge.historicalTransfers', { number: 0 })}</Tab>
          </TabList>
          <CustomTabPanel>
            {routesLoaderStatus && (
              <LoaderWrapper>
                <Loader height={'auto'} size={100} />
              </LoaderWrapper>
            )}
            <Routes>
              {routes &&
                routes.length > 0 &&
                routes.map((route, index) => {
                  return (
                    <BridgeRoute
                      key={index}
                      onSelectRoute={() => {
                        onSelectRoute(route);
                      }}
                      steps={route.steps}
                      transactionType={route.transactionType}
                      selected={route.selected}
                      toAmount={route.toAmount}
                      toAmountUSD={route.toAmountUSD}
                      waitingTime={route.waitingTime}
                      gasCostUSD={route.gasCostUSD}
                      fromChainId={route.fromChainId}
                      fromAmount={route.fromAmount}
                      fromToken={route.fromToken}
                      toChainId={route.toChainId}
                      toToken={route.toToken}
                    />
                  );
                })}
            </Routes>
            {(!routes || routes.length === 0) && (
              <Box display={'flex'} alignContent={'center'} justifyContent={'center'}>
                <Text color={'bridge.text'} fontSize={[16, 14]} fontWeight={600} pb={'0.2rem'}>
                  {t('bridge.noRoute')}
                </Text>
              </Box>
            )}
          </CustomTabPanel>
          <TabPanel>
            <Transfers>
              <BridgeTransfer
                date={'9/10/2022, 7:53:00 AM'}
                from={'1.0000'}
                fromChain={currency0}
                fromCoin={currency1}
                to={'22.3615'}
                toChain={currency0}
                toCoin={currency1}
                via={'PANGOLIN > DODO'}
                state={BridgeState.PENDING}
              />
              <BridgeTransfer
                date={'9/10/2022, 7:50:00 AM'}
                from={'1.0000'}
                fromChain={currency0}
                fromCoin={currency1}
                to={'0.1564'}
                toChain={currency0}
                toCoin={currency1}
                via={'PANGOLIN > DODO'}
                state={BridgeState.PENDING}
              />
            </Transfers>
          </TabPanel>
          <TabPanel>Panel 3</TabPanel>
        </Tabs>
      </Transactions>
    </PageWrapper>
  );
};

export default Bridge;
