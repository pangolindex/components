import React from 'react';
import { DoubleSideStakingInfo, PoolType } from 'src/state/pstake/types';
import PoolListV1 from '../PoolList/PoolListV1';

interface Props {
  type: string;
  stakingInfos: DoubleSideStakingInfo[];
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
}

const PoolV1: React.FC<Props> = ({ type, stakingInfos, setMenu, activeMenu, menuItems }) => {
  if (type === PoolType.own) {
    stakingInfos = (stakingInfos || []).filter((stakingInfo) => {
      return Boolean(stakingInfo.stakedAmount.greaterThan('0'));
    });
  }

  return (
    <PoolListV1
      version="1"
      stakingInfos={stakingInfos}
      activeMenu={activeMenu}
      setMenu={setMenu}
      menuItems={menuItems}
    />
  );
};

export default PoolV1;
