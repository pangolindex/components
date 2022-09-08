import { CHAINS, ChefType } from '@pangolindex/sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Drawer from 'src/components/Drawer';
import { useChainId } from 'src/hooks';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { SpaceType, StakingInfo } from 'src/state/pstake/types';
import StakeV3 from '../PangoChef/Stake';
import Stake from '../Stake';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  backgroundColor?: string;
  version: number;
  stakingInfo: StakingInfo;
  combinedApr?: number;
};

const FarmDrawer: React.FC<Props> = ({ isOpen, onClose, backgroundColor, version, stakingInfo, combinedApr }) => {
  const { t } = useTranslation();

  const chainId = useChainId();
  const chefType = CHAINS[chainId].contracts?.mini_chef?.type;

  const renderBody = () => {
    if (chefType === ChefType.PANGO_CHEF) {
      return (
        <StakeV3
          onComplete={onClose}
          type={SpaceType.card}
          stakingInfo={stakingInfo as PangoChefInfo}
          combinedApr={combinedApr}
        />
      );
    }
    return (
      <Stake
        version={version}
        onComplete={onClose}
        type={SpaceType.card}
        stakingInfo={stakingInfo}
        combinedApr={combinedApr}
      />
    );
  };

  return (
    <Drawer title={t('earn.deposit')} pb={10} isOpen={isOpen} onClose={onClose} backgroundColor={backgroundColor}>
      {isOpen && renderBody()}
    </Drawer>
  );
};

export default FarmDrawer;
