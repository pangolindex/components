import React from 'react';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { PoolType } from 'src/state/pstake/types';
import PoolListV3 from './PoolList/PoolListV3';

interface Props {
  type: string;
  pangoChefStakingInfos: PangoChefInfo[];
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
}

const PoolV3: React.FC<Props> = ({ type, setMenu, activeMenu, menuItems, pangoChefStakingInfos }) => {
  if (type === PoolType.own) {
    pangoChefStakingInfos = (pangoChefStakingInfos || []).filter((stakingInfo) => {
      return Boolean(stakingInfo.stakedAmount.greaterThan('0'));
    });
  }

  if (type === PoolType.superFarms) {
    pangoChefStakingInfos = (pangoChefStakingInfos || []).filter(
      (item) => (item?.rewardTokensAddress?.length || 0) > 1,
    );
  }

  return (
    <PoolListV3
      version="3"
      stakingInfos={pangoChefStakingInfos}
      activeMenu={activeMenu}
      setMenu={setMenu}
      menuItems={menuItems}
    />
  );
};

export default PoolV3;
