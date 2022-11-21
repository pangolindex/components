import React, { useContext, useEffect } from 'react';
import { ThemeContext } from 'styled-components';
import { Modal } from 'src/components';
import { useDispatch } from 'src/state';
import { ApplicationModal } from 'src/state/papplication/actions';
import { useModalOpen, usePoolDetailnModalToggle } from 'src/state/papplication/hooks';
import { resetMintState } from 'src/state/pmint/actions';
import { StakingInfo } from 'src/state/pstake/types';
import DetailView from './DetailView';

export interface DetailModalProps {
  stakingInfo: StakingInfo;
  version: number;
}

const DetailModal = ({ stakingInfo, version }: DetailModalProps) => {
  const detailModalOpen = useModalOpen(ApplicationModal.POOL_DETAIL);
  const togglePoolDetailModal = usePoolDetailnModalToggle();
  const theme = useContext(ThemeContext);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetMintState());
  }, [detailModalOpen, dispatch]);

  return (
    <Modal
      isOpen={detailModalOpen}
      onDismiss={togglePoolDetailModal}
      overlayBG={theme.modalBG2}
      closeOnClickOutside={false}
    >
      <DetailView stakingInfo={stakingInfo} onDismiss={togglePoolDetailModal} version={version} />
    </Modal>
  );
};
export default DetailModal;
