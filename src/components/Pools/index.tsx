import React from 'react';
import { DoubleSideStakingInfo, MinichefStakingInfo } from 'src/state/pstake/types';
import PoolV1 from './PoolV1';
import PoolV2 from './PoolV2';

interface Props {
  version: number;
  type: string;
  stakingInfoV1: DoubleSideStakingInfo[];
  miniChefStakingInfo: MinichefStakingInfo[];
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
}

const Pools: React.FC<Props> = ({
  version,
  type,
  stakingInfoV1,
  miniChefStakingInfo,
  setMenu,
  activeMenu,
  menuItems,
}) => {
  return version === 1 ? (
    <PoolV1 type={type} stakingInfos={stakingInfoV1} activeMenu={activeMenu} setMenu={setMenu} menuItems={menuItems} />
  ) : (
    <PoolV2
      type={type}
      activeMenu={activeMenu}
      setMenu={setMenu}
      menuItems={menuItems}
      miniChefStakingInfo={miniChefStakingInfo}
    />
  );
};

export default Pools;
