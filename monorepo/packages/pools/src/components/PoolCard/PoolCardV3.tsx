import React from 'react';
import { useGetRewardTokens } from 'src/hooks/minichef/hooks/common';
import { PangoChefInfo } from 'src/hooks/pangochef/types';
import PoolCardViewV3 from './PoolCardViewV3';

export interface PoolCardProps {
  stakingInfo: PangoChefInfo;
  onClickViewDetail: () => void;
  version: number;
}

const PoolCardV3 = ({ stakingInfo, onClickViewDetail, version }: PoolCardProps) => {
  const rewardTokens = useGetRewardTokens(stakingInfo);

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
