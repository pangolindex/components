import { useChainId } from '@honeycomb/shared';
import { SwapWidget } from '@honeycomb/swap';
import { CHAINS } from '@pangolindex/sdk';
import React from 'react';
import { GridContainer, SwapWidgetWrapper } from './styled';

function Swap() {
  const chainId = useChainId();

  return (
    <GridContainer>
      <>Watchlist</>
      <SwapWidgetWrapper>
        <SwapWidget
          isTWAPOrderVisible={CHAINS[chainId]?.mainnet && CHAINS[chainId]?.supported_by_twap}
          isLimitOrderVisible={CHAINS[chainId]?.mainnet && CHAINS[chainId]?.supported_by_gelato}
        />
      </SwapWidgetWrapper>
    </GridContainer>
  );
}

export default Swap;
