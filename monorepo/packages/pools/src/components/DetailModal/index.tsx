import { Modal } from '@pangolindex/core';
import { Pair } from '@pangolindex/sdk';
import {
  ApplicationModal,
  useModalOpen,
  usePoolDetailnModalToggle,
  useUpdateSelectedPoolId,
} from '@pangolindex/state-hooks';
import React, { useCallback, useContext, useEffect } from 'react';
import { ThemeContext } from 'styled-components';
import { DoubleSideStakingInfo } from 'src/hooks/minichef/types';
import { useBurnStateAtom } from 'src/hooks/state/burn/atom';
import { useMintStateAtom } from 'src/hooks/state/mint/atom';
import DetailView from './DetailView';

export interface DetailModalProps {
  stakingInfo: DoubleSideStakingInfo;
  version: number;
}

const DetailModal = ({ stakingInfo, version }: DetailModalProps) => {
  const detailModalOpen = useModalOpen(ApplicationModal.POOL_DETAIL);
  const togglePoolDetailModal = usePoolDetailnModalToggle();
  const updateSelectedPoolId = useUpdateSelectedPoolId();
  const theme = useContext(ThemeContext);
  const { resetBurnState } = useBurnStateAtom();
  const { resetMintState } = useMintStateAtom();

  const pairAddress =
    stakingInfo?.tokens?.[0] && stakingInfo?.tokens?.[1]
      ? Pair.getAddress(stakingInfo.tokens[0], stakingInfo.tokens[1])
      : '';

  useEffect(() => {
    resetMintState({ pairAddress: pairAddress });
    resetBurnState({ pairAddress: pairAddress });
  }, [detailModalOpen, resetMintState, resetBurnState]);

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
