import React, { useState } from 'react';
import LimitOrder from './LimitOrder';
import MarketOrder from './MarketOrder';
import { Root } from './styled';

interface Props {
  isLimitOrderVisible?: boolean;
  showSettings?: boolean;
}

const SwapWidget: React.FC<Props> = ({ isLimitOrderVisible = false, showSettings = true }) => {
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
        />
      ) : (
        <MarketOrder
          swapType={swapType}
          setSwapType={(type) => {
            setSwapType(type);
          }}
          isLimitOrderVisible={isLimitOrderVisible}
          showSettings={showSettings}
        />
      )}
    </Root>
  );
};
export default SwapWidget;
