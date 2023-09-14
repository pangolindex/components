import { useTokensContract } from '@honeycomb-finance/state-hooks';
import React from 'react';
import { DoubleSideStakingInfo } from 'src/hooks/minichef/types';
import PoolCardView from './PoolCardView';

export interface PoolCardV1Props {
  stakingInfo: DoubleSideStakingInfo;
  onClickViewDetail: () => void;
  version: number;
}

const PoolCardV1 = ({ stakingInfo, onClickViewDetail, version }: PoolCardV1Props) => {
  const rewardTokens = useTokensContract(stakingInfo?.rewardTokensAddress);

  return (
    <PoolCardView
      combinedApr={stakingInfo.combinedApr}
      earnedAmount={stakingInfo?.earnedAmount}
      rewardTokens={rewardTokens}
      stakingInfo={stakingInfo}
      onClickViewDetail={onClickViewDetail}
      version={version}
    />
  );
};

export default PoolCardV1;
