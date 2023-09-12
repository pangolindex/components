import { Drawer } from '@honeycomb/core';
import { useTranslation } from '@honeycomb/shared';
import React from 'react';
import { DoubleSideStakingInfo } from 'src/hooks/minichef/types';
import Remove from '../Remove';

type Props = {
  isOpen: boolean;
  stakingInfo: DoubleSideStakingInfo;
  onClose: () => void;
  version: number;
  redirectToCompound?: () => void;
};

const RemoveDrawer: React.FC<Props> = ({ isOpen, onClose, stakingInfo, version, redirectToCompound }) => {
  const { t } = useTranslation();
  return (
    <Drawer title={t('removeLiquidity.remove')} isOpen={isOpen} onClose={onClose}>
      {isOpen && (
        <Remove stakingInfo={stakingInfo} onClose={onClose} version={version} redirectToCompound={redirectToCompound} />
      )}
    </Drawer>
  );
};

export default RemoveDrawer;
