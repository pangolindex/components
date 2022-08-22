import { TokenAmount } from '@pangolindex/sdk';
import React from 'react';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';
import { MinichefStakingInfo } from 'src/state/pstake/types';
import PoolCardView from './PoolCardView';

export interface PoolCardProps {
  stakingInfo: MinichefStakingInfo;
  onClickViewDetail: () => void;
  version: number;
}

const PoolCardV3 = ({ stakingInfo, onClickViewDetail, version }: PoolCardProps) => {
  const chainId = useChainId();

  return (
    <PoolCardView
      combinedApr={0}
      earnedAmount={new TokenAmount(PNG[chainId], '0')}
      rewardTokens={undefined}
      stakingInfo={stakingInfo}
      onClickViewDetail={onClickViewDetail}
      version={version}
    />
  );
};

export default PoolCardV3;
