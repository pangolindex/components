import React from 'react';
import { SwapWidget, WatchList } from '@components/index';
import { SwapWidgetWrapper } from './styled';

function Swap() {
  return (
    <>
      <SwapWidgetWrapper>
        <SwapWidget />
      </SwapWidgetWrapper>

      <WatchList coinChartVisible={true} />
    </>
  );
}

export default Swap;
