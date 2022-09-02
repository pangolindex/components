import React, { useState } from 'react';
import { SwapTypes, ZERO_ADDRESS } from 'src/constants';
import LimitOrder from './LimitOrder';
import MarketOrder from './MarketOrder';
import { Root } from './styled';

export interface SwapWidgetProps {
  onSwapTypeChange?: React.Dispatch<React.SetStateAction<SwapTypes>>;
  isLimitOrderVisible?: boolean;
  showSettings?: boolean;
  partnerDaaS?: string;
  defaultInputToken?: string;
  defaultOutputToken?: string;
}

const SwapWidget: React.FC<SwapWidgetProps> = ({
  isLimitOrderVisible = false,
  onSwapTypeChange,
  showSettings = true,
  partnerDaaS = ZERO_ADDRESS,
  defaultInputToken,
  defaultOutputToken,
}) => {
  const [swapType, setSwapType] = useState(SwapTypes.MARKET);

  return (
    <Root>
      {swapType === SwapTypes.LIMIT ? (
        <LimitOrder
          swapType={swapType}
          setSwapType={(type: SwapTypes) => {
            setSwapType(type);
            onSwapTypeChange && onSwapTypeChange(type);
          }}
          isLimitOrderVisible={isLimitOrderVisible}
          defaultInputAddress={defaultInputToken}
          defaultOutputAddress={defaultOutputToken}
        />
      ) : (
        <MarketOrder
          swapType={swapType}
          setSwapType={(type: SwapTypes) => {
            setSwapType(type);
            onSwapTypeChange && onSwapTypeChange(type);
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
