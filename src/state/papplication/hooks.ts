import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useActiveWeb3React } from '../../hooks';
import { AppDispatch, AppState } from '../index';
import { ApplicationModal, PopupContent, addPopup, removePopup, setOpenModal } from './actions';

export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React();

  return useSelector((state: AppState) => state.papplication.blockNumber[chainId ?? -1]);
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useSelector((state: AppState) => state.papplication.openModal);
  return openModal === modal;
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal);
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open]);
}

export function useWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WALLET);
}

// returns a function that allows adding a popup
export function useAddPopup(): (content: PopupContent, key?: string) => void {
  const dispatch = useDispatch();

  return useCallback(
    (content: PopupContent, key?: string) => {
      dispatch(addPopup({ content, key }));
    },
    [dispatch],
  );
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useDispatch();
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }));
    },
    [dispatch],
  );
}

// get the list of active popups
export function useActivePopups(): AppState['papplication']['popupList'] {
  const list = useSelector((state: AppState) => state.papplication.popupList);
  return useMemo(() => list.filter((item) => item.show), [list]);
}
