import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import React from 'react';
import { Box } from 'src/components';
import LiquidityChartRangeInput from 'src/components/LiquidityChartRangeInput';
import { FeeAmount } from 'src/components/LiquidityChartRangeInput/types';

const currency0 = new Token(ChainId.AVALANCHE, '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', 6, 'USDC', 'USD Coin');
const currency1 = new Token(
  ChainId.AVALANCHE,
  CHAINS[ChainId.AVALANCHE].contracts!.png,
  18,
  CHAINS[ChainId.AVALANCHE].png_symbol!,
  'Pangolin',
);

const PriceGraph: React.FC = () => {
  return (
    <Box pb={'30px'}>
      <LiquidityChartRangeInput
        currency0={currency0}
        currency1={currency1}
        ticksAtLimit={{
          UPPER: false,
          LOWER: false,
        }}
        price={5.87}
        feeAmount={FeeAmount.MEDIUM}
        onLeftRangeInput={function (typedValue): void {
          console.log('onLeftRangeInput: ', typedValue);
        }}
        onRightRangeInput={function (typedValue): void {
          console.log('onRightRangeInput: ', typedValue);
        }}
        interactive={true}
      />
    </Box>
  );
};

export default PriceGraph;
