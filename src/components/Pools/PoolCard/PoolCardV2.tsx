import React from 'react';
import { useGetEarnedAmount, useGetFarmApr, useGetRewardTokens } from 'src/state/pstake/hooks';
import { MinichefStakingInfo } from 'src/state/pstake/types';
import PoolCardView from './PoolCardView';

export interface PoolCardProps {
  stakingInfo: MinichefStakingInfo;
  onClickViewDetail: () => void;
  version: number;
}

const PoolCardV2 = ({ stakingInfo, onClickViewDetail, version }: PoolCardProps) => {
  const { combinedApr } = useGetFarmApr(stakingInfo?.pid);
  const { earnedAmount } = useGetEarnedAmount(stakingInfo?.pid);

  const rewardTokens = useGetRewardTokens(stakingInfo?.rewardTokens, stakingInfo.rewardTokensAddress);

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
