import React, { useState } from 'react';
import LimitOrder from './LimitOrder';
import MarketOrder from './MarketOrder';
import { Root } from './styled';

const SwapWidget = () => {
  const [swapType, setSwapType] = useState('MARKET' as string);

  return (
    <Root>
      {swapType === 'LIMIT' ? (
        <LimitOrder
          swapType={swapType}
          setSwapType={(type) => {
            setSwapType(type);
          }}
        />
      ) : (
        <MarketOrder
          swapType={swapType}
          setSwapType={(type) => {
            setSwapType(type);
          }}
        />
      )}
    </Root>
  );
};
export default SwapWidget;
