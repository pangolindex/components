import { Drawer } from '@honeycomb-finance/core';
import { useTranslation } from '@honeycomb-finance/shared';
import React from 'react';
import { DoubleSideStakingInfo } from 'src/hooks/minichef/types';
import ClaimReward from '../ClaimReward';

type Props = {
  isOpen: boolean;
  stakingInfo: DoubleSideStakingInfo;
  onClose: () => void;
  version: number;
  backgroundColor?: string;
};

const ClaimDrawer: React.FC<Props> = ({ isOpen, onClose, stakingInfo, version, backgroundColor }) => {
  const { t } = useTranslation();
  return (
    <Drawer title={t('earn.claim')} isOpen={isOpen} onClose={onClose} backgroundColor={backgroundColor}>
      {isOpen && <ClaimReward stakingInfo={stakingInfo} onClose={onClose} version={version} />}
    </Drawer>
  );
};

export default ClaimDrawer;
