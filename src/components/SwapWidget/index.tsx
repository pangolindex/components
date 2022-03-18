import React, { useState } from 'react';
import LimitOrder from './LimitOrder';
import MarketOrder from './MarketOrder';
import { Root } from './styled';

interface Props {
  isLimitOrderVisible?: boolean;
}

const SwapWidget: React.FC<Props> = ({ isLimitOrderVisible = false }) => {
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
        />
      )}
    </Root>
  );
};
export default SwapWidget;
