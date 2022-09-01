import React, { useState } from 'react';
import { ZERO_ADDRESS } from 'src/constants';
import LimitOrder from './LimitOrder';
import MarketOrder from './MarketOrder';
import { Root } from './styled';

export interface SwapWidgetProps {
  isLimitOrderVisible?: boolean;
  showSettings?: boolean;
  partnerDaaS?: string;
  defaultInputToken?: string;
  defaultOutputToken?: string;
}

const SwapWidget: React.FC<SwapWidgetProps> = ({
  isLimitOrderVisible = false,
  showSettings = true,
  partnerDaaS = ZERO_ADDRESS,
  defaultInputToken,
  defaultOutputToken,
}) => {
  const [swapType, setSwapType] = useState('MARKET' as string);

  return (
    <Root>
      {swapType === 'LIMIT' ? (
        <LimitOrder
          swapType={swapType}
          setSwapType={(type) => {
            setSwapType(type);
          }}
          isLimitOrderVisible={isLimitOrderVisible}
          defaultInputAddress={defaultInputToken}
          defaultOutputAddress={defaultOutputToken}
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
          defaultInputAddress={defaultInputToken}
          defaultOutputAddress={defaultOutputToken}
        />
      )}
    </Root>
  );
};
export default SwapWidget;
