import { Pair } from '@pangolindex/sdk';
import React, { useCallback, useContext, useEffect } from 'react';
import { ThemeContext } from 'styled-components';
import { Modal } from 'src/components';
import { ApplicationModal } from 'src/state/papplication/atom';
import { useModalOpen, usePoolDetailnModalToggle, useUpdateSelectedPoolId } from 'src/state/papplication/hooks';
import { useBurnStateAtom } from 'src/state/pburn/atom';
import { useMintStateAtom } from 'src/state/pmint/atom';
import { DoubleSideStakingInfo } from 'src/state/pstake/types';
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
