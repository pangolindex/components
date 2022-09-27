import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BridgeCard from './BridgeCard';
import BridgeRoute from './BridgeRoute';
import { Step } from './BridgeRoute/types';
import BridgeTransfer from './BridgeTransfer';
import { BridgeState } from './BridgeTransfer/types';
import { PageWrapper, Routes, STab, STabList, STabPanel, STabs, Transactions, Transfers } from './styles';

export enum BridgePrioritizations {
  recommended,
  fast,
  normal,
}

const Bridge = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const steps: Step[] = [
    {
      contractType: 'LI.FI Contract',
      subSteps: ['1. Swap to 0.0538 USDT via PANGOLIN', '2. Transfer to 0.0522 USDT via PANGOLIN'],
    },
    {
      contractType: 'LI.FI Contract',
      subSteps: ['1. Swap to 0.0538 USDT via DODO'],
    },
  ];

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
        <STabs
          selectedTabClassName="is-selected"
          selectedTabPanelClassName="is-selected"
          selectedIndex={tabIndex}
          onSelect={(index) => setTabIndex(index)}
        >
          <STabList>
            <STab>{t('bridge.availableRoutes', { number: 0 })}</STab>
            <STab>{t('bridge.activeTransfers', { number: 0 })}</STab>
            <STab disabled>{t('bridge.historicalTransfers', { number: 0 })}</STab>
          </STabList>
          <STabPanel>
            <Routes>
              <BridgeRoute
                steps={steps}
                transactionType={BridgePrioritizations.recommended}
                selected={true}
                estimatedToken={'0.0522 FRAX'}
                estimatedResult={'$0.05 USD'}
                min={'9:00'}
                gasCost={'95.30 USD'}
              />
              <BridgeRoute
                steps={steps}
                transactionType={BridgePrioritizations.fast}
                selected={false}
                estimatedToken={'0.0520 FRAX'}
                estimatedResult={'$0.0495 USD'}
                min={'2:00'}
                gasCost={'105.30 USD'}
              />
              <BridgeRoute
                steps={steps}
                transactionType={BridgePrioritizations.normal}
                selected={false}
                estimatedToken={'0.0529 FRAX'}
                estimatedResult={'$0.0503 USD'}
                min={'8:00'}
                gasCost={'100.30 USD'}
              />
            </Routes>
          </STabPanel>
          <STabPanel>
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
          </STabPanel>
          <STabPanel>Panel 3</STabPanel>
        </STabs>
      </Transactions>
    </PageWrapper>
  );
};

export default Bridge;
