import React from 'react';
import Remove from '../Remove';
import { DoubleSideStakingInfo } from 'src/hooks/minichef/types';
import { Drawer } from '@pangolindex/core';
import { useTranslation } from '@pangolindex/shared';

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
