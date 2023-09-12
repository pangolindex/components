import { JSBI } from '@pangolindex/sdk';
import { BIG_INT_ZERO } from '@honeycomb/shared';
import React, { useMemo } from 'react';
import { MinichefStakingInfo, PoolType } from 'src/hooks/minichef/types';
import PoolListV2 from '../PoolList/PoolListV2';

interface Props {
  type: string;
  miniChefStakingInfo: MinichefStakingInfo[];
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
}

const PoolV2: React.FC<Props> = ({ type, setMenu, activeMenu, menuItems, miniChefStakingInfo }) => {
  const stakingInfos = useMemo(() => {
    switch (type) {
      case PoolType.all:
        // remove all farms with weight (multipler) equal 0
        return (miniChefStakingInfo || []).filter((stakingInfo) =>
          JSBI.greaterThan(stakingInfo.multiplier, BIG_INT_ZERO),
        );
      case PoolType.own:
        // return all farms with staked amount greater than 0 or user have pending rewards on farm
        return (miniChefStakingInfo || []).filter((stakingInfo) => {
          return Boolean(
            stakingInfo.stakedAmount.greaterThan('0') ||
              stakingInfo.earnedAmount.greaterThan('0') ||
              stakingInfo.extraPendingRewards.some((pendingRewards) => JSBI.greaterThan(pendingRewards, BIG_INT_ZERO)),
          );
        });
      case PoolType.superFarms:
        // return all farms with reward tokens address greater than 1 and with weight (multipler) greater than 0
        return (miniChefStakingInfo || []).filter(
          (item) => (item?.rewardTokensAddress?.length || 0) > 0 && JSBI.greaterThan(item.multiplier, BIG_INT_ZERO),
        );
      default:
        return miniChefStakingInfo;
    }
  }, [type, miniChefStakingInfo]);

  return (
    <PoolListV2
      version="2"
      stakingInfos={stakingInfos}
      activeMenu={activeMenu}
      setMenu={setMenu}
      menuItems={menuItems}
    />
  );
};

export default PoolV2;
