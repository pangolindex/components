import React from 'react';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { useGetRewardTokens } from 'src/state/pstake/hooks';
import PoolCardViewV3 from './PoolCardViewV3';

export interface PoolCardProps {
  stakingInfo: PangoChefInfo;
  onClickViewDetail: () => void;
  version: number;
}

const PoolCardV3 = ({ stakingInfo, onClickViewDetail, version }: PoolCardProps) => {
  const rewardTokens = useGetRewardTokens(stakingInfo?.rewardTokens, stakingInfo.rewardTokensAddress);

  return (
    <PoolCardViewV3
      rewardTokens={rewardTokens}
      stakingInfo={stakingInfo}
      onClickViewDetail={onClickViewDetail}
      version={version}
    />
  );
};

export default PoolCardV3;
