import React from 'react';
import { Box, Button } from 'src/components';
import { useHederaPangochefContractCreateCallback } from 'src/state/ppangoChef/hooks';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { PoolType } from 'src/state/pstake/types';
import PoolListV3 from './PoolList/PoolListV3';
import { ContractWrapper } from './styleds';

interface Props {
  type: string;
  pangoChefStakingInfos: PangoChefInfo[];
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
}

const PoolV3: React.FC<Props> = ({ type, setMenu, activeMenu, menuItems, pangoChefStakingInfos }) => {
  const [shouldCreateStorage, create] = useHederaPangochefContractCreateCallback();

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

  const renderContent = () => {
    if (shouldCreateStorage) {
      return (
        <ContractWrapper>
          <Box textAlign="center" color="color4">
            Create Your Pangochef Contract
          </Box>
          <Button variant="primary" onClick={create} height="45px">
            Create
          </Button>
        </ContractWrapper>
      );
    } else {
      return (
        <PoolListV3
          version="3"
          stakingInfos={pangoChefStakingInfos}
          activeMenu={activeMenu}
          setMenu={setMenu}
          menuItems={menuItems}
        />
      );
    }
  };

  return <>{renderContent()}</>;
};

export default PoolV3;
