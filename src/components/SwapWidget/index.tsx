import React, { useState } from 'react';
import { SwapTypes, ZERO_ADDRESS } from 'src/constants';
import LimitOrder from './LimitOrder';
import MarketOrder from './MarketOrder';
import TWAP from './TWAP/TWAPPanel';
import { Root } from './styled';

export interface SwapWidgetProps {
  onSwapTypeChange?: React.Dispatch<React.SetStateAction<SwapTypes>>;
  isLimitOrderVisible?: boolean;
  isTWAPOrderVisible?: boolean;
  showSettings?: boolean;
  partnerDaaS?: string;
  defaultInputToken?: string;
  defaultOutputToken?: string;
}

const SwapWidget: React.FC<SwapWidgetProps> = ({
  isLimitOrderVisible = false,
  isTWAPOrderVisible = false,
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
          isTWAPOrderVisible={isTWAPOrderVisible}
          defaultInputAddress={defaultInputToken}
          defaultOutputAddress={defaultOutputToken}
        />
      ) : swapType === SwapTypes.TWAP ? (
        <TWAP
          swapType={swapType}
          setSwapType={(type: SwapTypes) => {
            setSwapType(type);
            onSwapTypeChange && onSwapTypeChange(type);
          }}
          isLimitOrderVisible={isLimitOrderVisible}
          isTWAPOrderVisible={isTWAPOrderVisible}
          defaultInputAddress={defaultInputToken}
          defaultOutputAddress={defaultOutputToken}
          partnerDaaS={partnerDaaS}
        />
      ) : (
        <MarketOrder
          swapType={swapType}
          setSwapType={(type: SwapTypes) => {
            setSwapType(type);
            onSwapTypeChange && onSwapTypeChange(type);
          }}
          isLimitOrderVisible={isLimitOrderVisible}
          isTWAPOrderVisible={isTWAPOrderVisible}
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
