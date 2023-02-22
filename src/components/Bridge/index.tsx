import { BRIDGE_PARTNERS } from '@pangolindex/sdk';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CountdownCounter, Loader, Text, Tooltip } from 'src/components';
import { usePangolinWeb3 } from 'src/hooks';
import { ChainField, CurrencyField } from 'src/state/pbridge/actions';
import { useBridgeActionHandlers, useBridgeSwapActionHandlers, useDerivedBridgeInfo } from 'src/state/pbridge/hooks';
import { Route } from 'src/state/pbridge/types';
import { useUserSlippageTolerance } from 'src/state/puser/hooks';
import { Tab, TabList, Tabs } from '../Tabs';
import BridgeCard from './BridgeCard';
import BridgeRoute from './BridgeRoute';
import { CustomTabPanel, LoaderWrapper, PageWrapper, PartnerLogos, Partners, Routes, Transactions } from './styles';

const Bridge = () => {
  const { routes, routesLoaderStatus } = useDerivedBridgeInfo();
  const { getRoutes } = useBridgeSwapActionHandlers();
  const { onSelectRoute, onChangeRouteLoaderStatus } = useBridgeActionHandlers();
  const [userSlippage] = useUserSlippageTolerance();
  const [slippageTolerance, setSlippageTolerance] = useState((userSlippage / 100).toString());
  const [tabIndex, setTabIndex] = useState(0);
  const { t } = useTranslation();
  const { account } = usePangolinWeb3();

  const { currencies, chains, parsedAmount, recipient } = useDerivedBridgeInfo();

  const inputCurrency = currencies[CurrencyField.INPUT];
  const outputCurrency = currencies[CurrencyField.OUTPUT];
  const fromChain = chains[ChainField.FROM];
  const toChain = chains[ChainField.TO];

  const getAllRoutes = useCallback(() => {
    if (parsedAmount) {
      onChangeRouteLoaderStatus();
      getRoutes({
        amount: parsedAmount?.toExact(),
        slipLimit: slippageTolerance,
        fromChain,
        toChain,
        fromAddress: account,
        fromCurrency: inputCurrency,
        toCurrency: outputCurrency,
        recipient,
      });
    }
  }, [parsedAmount, slippageTolerance, fromChain, toChain, account, inputCurrency, outputCurrency, recipient]);

  return (
    <div>
      <PageWrapper>
        <BridgeCard
          slippageTolerance={slippageTolerance}
          account={account}
          fromChain={fromChain}
          inputCurrency={inputCurrency}
          outputCurrency={outputCurrency}
          recipient={recipient}
          toChain={toChain}
          setSlippageTolerance={setSlippageTolerance}
          getRoutes={getRoutes}
        />
        <Transactions>
          <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
            <TabList>
              <Tab>{t('bridge.availableRoutes', { number: routes?.length || 0 })}</Tab>
              {routes && routes.length > 0 && !routesLoaderStatus && (
                <div style={{ width: '25px' }}>
                  <CountdownCounter
                    value={60}
                    maxValue={60}
                    minValue={0}
                    counterClockwise={false}
                    onFinish={getAllRoutes}
                  />
                </div>
              )}
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
                  routes.map((route: Route, index) => {
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
                        gasCostUSD={route?.gasCostUSD}
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
          </Tabs>
        </Transactions>
      </PageWrapper>
      <Partners>
        <Text color={'bridge.text'} fontSize={[28, 26]} fontWeight={700} pb={'0.2rem'}>
          {t('bridge.poweredBy')}
        </Text>
        <PartnerLogos>
          {BRIDGE_PARTNERS.map((partner, index) => (
            <div key={index}>
              <Tooltip id={`partner-${index}`} effect="solid">
                {partner.name}
              </Tooltip>
              <img data-tip data-for={`partner-${index}`} src={partner.logo} width={64} height={64} />
            </div>
          ))}
        </PartnerLogos>
      </Partners>
    </div>
  );
};

export default Bridge;
