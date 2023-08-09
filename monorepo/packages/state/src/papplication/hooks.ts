import { useChainId } from '@pangolindex/hooks';
import { useCallback, useMemo } from 'react';
import { ApplicationModal, PopupContent, PopupList, useApplicationState } from './atom';

export function useBlockNumber(): number | undefined {
  const chainId = useChainId();
  const { blockNumbers } = useApplicationState();
  return blockNumbers?.[chainId];
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const { openModal } = useApplicationState();

  return openModal === modal;
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal);

  const { setOpenModal } = useApplicationState();
  return useCallback(() => setOpenModal(open ? null : modal), [setOpenModal, modal, open]);
}

export function useWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WALLET);
}

/**
 * This hook open the wallet modal with a selected chain
 * @returns function to open the modal where the chainId is the id of seleted chain
 */
export function useWalletModalToggleWithChainId(): (chainId: number | undefined) => void {
  const open = useModalOpen(ApplicationModal.WALLET);
  const { setOpenModal, setWalletModalChainId } = useApplicationState();

  return useCallback(
    (chainId: number | undefined) => {
      setWalletModalChainId(chainId);
      setOpenModal(chainId && !open ? ApplicationModal.WALLET : null);
    },
    [setWalletModalChainId, setOpenModal, open],
  );
}

export function usePoolDetailnModalToggle(): () => void {
  return useToggleModal(ApplicationModal.POOL_DETAIL);
}

// returns a function that allows adding a popup
export function useAddPopup(): (content: PopupContent, key?: string) => void {
  const { addPopup } = useApplicationState();

  return useCallback(
    (content: PopupContent, key?: string) => {
      addPopup({ content, key });
    },
    [addPopup],
  );
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const { removePopup } = useApplicationState();
  return useCallback(
    (key: string) => {
      removePopup({ key });
    },
    [removePopup],
  );
}

// get the list of active popups
export function useActivePopups(): PopupList {
  const { popupList: list } = useApplicationState();

  return useMemo(() => list.filter((item) => item.show), [list]);
}

export function useGetSelectedPoolId(): string | undefined {
  const { selectedPoolId } = useApplicationState();

  return selectedPoolId;
}

export function useUpdateSelectedPoolId(): (poolId: string | undefined) => void {
  const { setSelectedPooId } = useApplicationState();
  return useCallback((poolId: string | undefined) => setSelectedPooId(poolId), [setSelectedPooId]);
}

export function useShouldUseSubgraph(): boolean {
  const chainId = useChainId();
  const { useSubgraph } = useApplicationState();
  return useSubgraph?.[chainId];
}

export function useToggleDelegateModal(): () => void {
  return useToggleModal(ApplicationModal.DELEGATE);
}
