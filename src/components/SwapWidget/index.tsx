import React, { useState } from 'react';
import { ZERO_ADDRESS } from 'src/constants';
import LimitOrder from './LimitOrder';
import MarketOrder from './MarketOrder';
import { Root } from './styled';

export interface Props {
  isLimitOrderVisible?: boolean;
  showSettings?: boolean;
  partnerDaaS?: string;
}

const SwapWidget: React.FC<Props> = ({
  isLimitOrderVisible = false,
  showSettings = true,
  partnerDaaS = ZERO_ADDRESS,
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
        />
      )}
    </Root>
  );
};
export default SwapWidget;
