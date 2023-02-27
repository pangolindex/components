import { Pair } from '@pangolindex/sdk';
import React, { useCallback, useContext, useEffect } from 'react';
import { ThemeContext } from 'styled-components';
import { Modal } from 'src/components';
import { useDispatch } from 'src/state';
import { ApplicationModal } from 'src/state/papplication/actions';
import { useModalOpen, usePoolDetailnModalToggle, useUpdateSelectedPoolId } from 'src/state/papplication/hooks';
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
  const updateSelectedPoolId = useUpdateSelectedPoolId();
  const theme = useContext(ThemeContext);

  const dispatch = useDispatch();

  const pairAddress =
    stakingInfo?.tokens?.[0] && stakingInfo?.tokens?.[1]
      ? Pair.getAddress(stakingInfo.tokens[0], stakingInfo.tokens[1])
      : '';

  useEffect(() => {
    dispatch(resetMintState({ pairAddress: pairAddress }));
  }, [detailModalOpen, dispatch]);

  const handleOnDismiss = useCallback(() => {
    updateSelectedPoolId(undefined);
    togglePoolDetailModal();
  }, [updateSelectedPoolId, togglePoolDetailModal]);

  return (
    <Modal isOpen={detailModalOpen} onDismiss={handleOnDismiss} overlayBG={theme.modalBG2} closeOnClickOutside={false}>
      <DetailView stakingInfo={stakingInfo} onDismiss={handleOnDismiss} version={version} />
    </Modal>
  );
};
export default DetailModal;
