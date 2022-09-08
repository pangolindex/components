import { CHAINS, ChefType, Currency } from '@pangolindex/sdk';
import React, { useState } from 'react';
import { useChainId } from 'src/hooks';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { SpaceType, StakingInfo } from 'src/state/pstake/types';
import AddLiquidity from '../AddLiquidity';
import StakeV3 from '../PangoChef/Stake';
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

  const chainId = useChainId();
  const chefType = CHAINS[chainId].contracts?.mini_chef?.type;

  return (
    <Root>
      <EarnOption type={type} setType={setType} />
      {type === TradeType.Pool ? (
        <AddLiquidity currencyA={currencyA} currencyB={currencyB} type={SpaceType.detail} />
      ) : chefType === ChefType.PANGO_CHEF ? (
        <StakeV3 type={SpaceType.detail} stakingInfo={stakingInfo as PangoChefInfo} />
      ) : (
        <Stake version={version} type={SpaceType.detail} stakingInfo={stakingInfo} />
      )}
    </Root>
  );
};
export default EarnWidget;
