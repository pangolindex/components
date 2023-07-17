import { JSBI } from '@pangolindex/sdk';
import React, { useMemo } from 'react';
import { BIG_INT_ZERO } from 'src/constants';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { PoolType } from 'src/state/pstake/types';
import PoolListV3 from '../PoolList/PoolListV3';

interface Props {
  type: string;
  pangoChefStakingInfos: PangoChefInfo[];
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
}

const PoolV3: React.FC<Props> = ({ type, setMenu, activeMenu, menuItems, pangoChefStakingInfos }) => {
  const stakingInfos = useMemo(() => {
    switch (type) {
      case PoolType.all:
        // remove all farms with weight (multipler) equal 0
        return (pangoChefStakingInfos || []).filter((stakingInfo) =>
          JSBI.greaterThan(stakingInfo.multiplier, BIG_INT_ZERO),
        );
      case PoolType.own:
        // return all farms with staked amount greater than 0 or user have pending rewards on farm
        return (pangoChefStakingInfos || []).filter((stakingInfo) => {
          return Boolean(
            stakingInfo.stakedAmount.greaterThan('0') ||
              stakingInfo.earnedAmount.greaterThan('0') ||
              stakingInfo.extraPendingRewards.some((pendingRewards) => JSBI.greaterThan(pendingRewards, BIG_INT_ZERO)),
          );
        });
      case PoolType.superFarms:
        // return all farms with reward tokens address greater than 0 and with weight (multipler) greater than 0
        return (pangoChefStakingInfos || []).filter(
          (item) => (item?.rewardTokensAddress?.length || 0) > 0 && JSBI.greaterThan(item.multiplier, BIG_INT_ZERO),
        );
      default:
        return pangoChefStakingInfos;
    }
  }, [type, pangoChefStakingInfos]);

  return (
    <PoolListV3
      version="3"
      stakingInfos={stakingInfos}
      activeMenu={activeMenu}
      setMenu={setMenu}
      menuItems={menuItems}
    />
  );
};

export default PoolV3;
