import React from 'react';
import { useTranslation } from 'react-i18next';
import Drawer from 'src/components/Drawer';
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

  const renderBody = () => {
    if (version === 3) {
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
    <Drawer title={t('earn.deposit')} isOpen={isOpen} onClose={onClose} backgroundColor={backgroundColor}>
      {isOpen && renderBody()}
    </Drawer>
  );
};

export default FarmDrawer;
