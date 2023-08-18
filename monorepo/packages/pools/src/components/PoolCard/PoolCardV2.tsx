import React from 'react';
import { useGetRewardTokens } from 'src/state/pstake/hooks/common';
import { MinichefStakingInfo } from 'src/state/pstake/types';
import PoolCardView from './PoolCardView';

export interface PoolCardProps {
  stakingInfo: MinichefStakingInfo;
  onClickViewDetail: () => void;
  version: number;
}

const PoolCardV2 = ({ stakingInfo, onClickViewDetail, version }: PoolCardProps) => {
  const { combinedApr, earnedAmount } = stakingInfo;

  const rewardTokens = useGetRewardTokens(stakingInfo);

  return (
    <PoolCardView
      combinedApr={combinedApr}
      earnedAmount={earnedAmount}
      rewardTokens={rewardTokens}
      stakingInfo={stakingInfo}
      onClickViewDetail={onClickViewDetail}
      version={version}
    />
  );
};

export default PoolCardV2;
