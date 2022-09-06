import React from 'react';
import { useTranslation } from 'react-i18next';
import Drawer from 'src/components/Drawer';
import { SpaceType, StakingInfo } from 'src/state/pstake/types';
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

  return (
    <Drawer title={t('earn.deposit')} pb={10} isOpen={isOpen} onClose={onClose} backgroundColor={backgroundColor}>
      {isOpen && (
        <Stake
          version={version}
          onComplete={onClose}
          type={SpaceType.card}
          stakingInfo={stakingInfo}
          combinedApr={combinedApr}
        />
      )}
    </Drawer>
  );
};

export default FarmDrawer;
