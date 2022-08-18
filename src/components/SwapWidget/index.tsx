import React, { useState } from 'react';
import { ZERO_ADDRESS } from 'src/constants';
import LimitOrder from './LimitOrder';
import MarketOrder from './MarketOrder';
import { Root } from './styled';

export interface Props {
  isLimitOrderVisible?: boolean;
  showSettings?: boolean;
  partnerDaaS?: string;
  defaultInputToken?: string;
  defaultOutputToken?: string;
}

const SwapWidget: React.FC<Props> = ({
  isLimitOrderVisible = false,
  showSettings = true,
  partnerDaaS = ZERO_ADDRESS,
  defaultInputToken,
  defaultOutputToken,
}) => {
  const [swapType, setSwapType] = useState('MARKET' as string);
  const [defaultInputCurrency, setDefaultInputCurrency] = useState(defaultInputToken as string);
  const [defaultOutputCurrency, setDefaultOutputCurrency] = useState(defaultOutputToken as string);

  const updateDefaultInputCurrency = (value: string) => {
    setDefaultInputCurrency(value);
  };

  const updateDefaultOutputCurrency = (value: string) => {
    setDefaultOutputCurrency(value);
  };

  return (
    <Root>
      {swapType === 'LIMIT' ? (
        <LimitOrder
          swapType={swapType}
          setSwapType={(type) => {
            setSwapType(type);
          }}
          isLimitOrderVisible={isLimitOrderVisible}
          defaultInputCurrency={defaultInputCurrency}
          defaultOutputCurrency={defaultOutputCurrency}
          updateDefaultOutputCurrency={updateDefaultOutputCurrency}
          updateDefaultInputCurrency={updateDefaultInputCurrency}
        />
      ) : (
        <MarketOrder
          swapType={swapType}
          setSwapType={(type) => {
            setSwapType(type);
          }}
          isLimitOrderVisible={isLimitOrderVisible}
          showSettings={showSettings}
          partnerDaaS={partnerDaaS}
          defaultInputCurrency={defaultInputCurrency}
          defaultOutputCurrency={defaultOutputCurrency}
          updateDefaultOutputCurrency={updateDefaultOutputCurrency}
          updateDefaultInputCurrency={updateDefaultInputCurrency}
        />
      )}
    </Root>
  );
};
export default SwapWidget;
