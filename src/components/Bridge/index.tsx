import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Loader, Text } from 'src/components';
import { useBridgeActionHandlers, useDerivedBridgeInfo } from 'src/state/pbridge/hooks';
import { Route } from 'src/state/pbridge/types';
import { Tab, TabList, Tabs } from '../Tabs';
import BridgeCard from './BridgeCard';
import BridgeRoute from './BridgeRoute';
import { CustomTabPanel, LoaderWrapper, PageWrapper, Routes, Transactions } from './styles';

const Bridge = () => {
  const { routes, routesLoaderStatus } = useDerivedBridgeInfo();
  const { onSelectRoute } = useBridgeActionHandlers();
  const [tabIndex, setTabIndex] = useState(0);
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <BridgeCard />
      <Transactions>
        <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
          <TabList>
            <Tab>{t('bridge.availableRoutes', { number: routes?.length || 0 })}</Tab>
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
  );
};

export default Bridge;
