import { Currency } from '@pangolindex/sdk';
import React, { useState } from 'react';
import { StakingInfo, SpaceType } from 'src/state/pstake/types';
import AddLiquidity from '../AddLiquidity';
import Stake from '../Stake';
import EarnOption, { TradeType } from './EarnOption';
import { Root } from './styled';

interface EarnWidgetProps {
  currencyA: Currency;
  currencyB: Currency;
  version: number;
  stakingInfo: StakingInfo;
}

const EarnWidget = ({ currencyA, currencyB, version, stakingInfo }: EarnWidgetProps) => {
  const [type, setType] = useState(TradeType.Pool as string);

  return (
    <Root>
      <EarnOption type={type} setType={setType} />
      {type === TradeType.Pool ? (
        <AddLiquidity currencyA={currencyA} currencyB={currencyB} type={SpaceType.detail} />
      ) : (
        <Stake version={version} type={SpaceType.detail} stakingInfo={stakingInfo} />
      )}
    </Root>
  );
};
export default EarnWidget;
