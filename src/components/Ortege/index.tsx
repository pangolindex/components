import React, {  useState } from 'react';
import { usePangolinWeb3 } from 'src/hooks';
import { ChainField, CurrencyField } from 'src/state/pbridge/atom';
import {  useBridgeSwapActionHandlers, useDerivedBridgeInfo } from 'src/state/pbridge/hooks';
import { useUserSlippageTolerance } from 'src/state/puser/hooks';
import OrtegeCard from './OrtegeCard';
import { PageWrapper } from './styles';

const Ortege = () => {
  const { getRoutes } = useBridgeSwapActionHandlers();

  const [userSlippage] = useUserSlippageTolerance();
  const [slippageTolerance, setSlippageTolerance] = useState((userSlippage / 100).toString());
  const { account } = usePangolinWeb3();

  const { currencies, chains, parsedAmount, recipient } = useDerivedBridgeInfo();

  const inputCurrency = currencies[CurrencyField.INPUT];
  const outputCurrency = currencies[CurrencyField.OUTPUT];
  const fromChain = chains[ChainField.FROM];
  const toChain = chains[ChainField.TO];

  return (
    <div>
      <PageWrapper>
        <OrtegeCard
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
      </PageWrapper>
    </div>
  );
};

export default Ortege;
