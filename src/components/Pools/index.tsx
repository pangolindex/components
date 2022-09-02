import React from 'react';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { DoubleSideStakingInfo, MinichefStakingInfo } from 'src/state/pstake/types';
import PoolV1 from './PoolV1';
import PoolV2 from './PoolV2';
import PoolV3 from './PoolV3';

interface Props {
  version: number;
  type: string;
  stakingInfoV1: DoubleSideStakingInfo[];
  miniChefStakingInfo: MinichefStakingInfo[];
  pangoChefStakingInfo: PangoChefInfo[];
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
}

const Pools: React.FC<Props> = ({
  version,
  type,
  stakingInfoV1,
  miniChefStakingInfo,
  pangoChefStakingInfo,
  setMenu,
  activeMenu,
  menuItems,
}) => {
  if (version == 1) {
    return (
      <PoolV1
        type={type}
        stakingInfos={stakingInfoV1}
        activeMenu={activeMenu}
        setMenu={setMenu}
        menuItems={menuItems}
      />
    );
  } else if (version === 2) {
    return (
      <PoolV2
        type={type}
        activeMenu={activeMenu}
        setMenu={setMenu}
        menuItems={menuItems}
        miniChefStakingInfo={miniChefStakingInfo}
      />
    );
  } else if (version === 3) {
    return (
      <PoolV3
        type={type}
        activeMenu={activeMenu}
        setMenu={setMenu}
        menuItems={menuItems}
        pangoChefStakingInfos={pangoChefStakingInfo}
      />
    );
  }

  return null;
};

export default Pools;
