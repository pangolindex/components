import React from 'react';
import { useMinichefPools } from 'src/state/pstake/hooks';
import { MinichefStakingInfo, PoolType } from 'src/state/pstake/types';
import PoolListV2 from './PoolList/PoolListV2';

interface Props {
  type: string;
  miniChefStakingInfo: MinichefStakingInfo[];
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
}

const PoolV2: React.FC<Props> = ({ type, setMenu, activeMenu, menuItems, miniChefStakingInfo }) => {
  const poolMap = useMinichefPools();

  if (type === PoolType.own) {
    miniChefStakingInfo = (miniChefStakingInfo || []).filter((stakingInfo) => {
      return Boolean(stakingInfo.stakedAmount.greaterThan('0'));
    });
  }

  if (type === PoolType.superFarms) {
    miniChefStakingInfo = (miniChefStakingInfo || []).filter((item) => (item?.rewardTokensAddress?.length || 0) > 1);
  }

  return (
    <PoolListV2
      version="2"
      stakingInfos={miniChefStakingInfo}
      poolMap={poolMap}
      activeMenu={activeMenu}
      setMenu={setMenu}
      menuItems={menuItems}
    />
  );
};

export default PoolV2;
