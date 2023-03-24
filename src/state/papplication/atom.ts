import { TokenList } from '@pangolindex/token-lists';
import { atom, useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';
import { SUPPORTED_WALLETS } from 'src/wallet';

export type PopupContent =
  | {
      txn: {
        hash: string;
        success: boolean;
        summary?: string;
      };
    }
  | {
      listUpdate: {
        listUrl: string;
        oldList: TokenList;
        newList: TokenList;
        auto: boolean;
      };
    };

export enum ApplicationModal {
  WALLET,
  POOL_DETAIL,
}

export type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>;

export interface ApplicationState {
  readonly blockNumbers: { readonly [chainId: number]: number };
  readonly popupList: PopupList;
  readonly openModal: ApplicationModal | null;
  readonly selectedPoolId: string | undefined;
  readonly isAvailableHashpack: boolean;
  readonly wallets: typeof SUPPORTED_WALLETS;
}

const blockNumbersAtom = atom<ApplicationState['blockNumbers']>({});
const popupListAtom = atom<ApplicationState['popupList']>([]);
const openModalAtom = atom<ApplicationState['openModal']>(null);
const selectedPoolIdAtom = atom<ApplicationState['selectedPoolId']>(undefined);
const isAvailableHashpackAtom = atom<ApplicationState['isAvailableHashpack']>(false);
const walletsAtom = atom<ApplicationState['wallets']>(SUPPORTED_WALLETS);

export function useApplicationState() {
  const [blockNumbers, setBlockNumbers] = useAtom(blockNumbersAtom);
  const [popupList, setPopupList] = useAtom(popupListAtom);
  const [openModal, setOpenModal] = useAtom(openModalAtom);
  const [selectedPoolId, setSelectedPooId] = useAtom(selectedPoolIdAtom);
  const [isAvailableHashpack, setAvailableHashpack] = useAtom(isAvailableHashpackAtom);
  const [wallets, setWallets] = useAtom(walletsAtom);

  const updateBlockNumber = useCallback(
    ({ chainId, blockNumber }: { chainId: number; blockNumber: number }) => {
      if (typeof blockNumbers?.[chainId] !== 'number') {
        setBlockNumbers({
          ...blockNumbers,
          [chainId]: blockNumber,
        });
      } else {
        setBlockNumbers({
          ...blockNumbers,
          [chainId]: Math.max(blockNumber, blockNumbers?.[chainId]),
        });
      }
    },
    [setBlockNumbers, blockNumbers],
  );

  const addPopup = useCallback(
    ({ content, key, removeAfterMs = 15000 }: { content: PopupContent; key?: string; removeAfterMs?: number }) => {
      const newPopupList = (key ? popupList.filter((popup) => popup.key !== key) : popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
        },
      ]);
      setPopupList(newPopupList);
    },
    [setPopupList, popupList],
  );

  const removePopup = useCallback(
    ({ key }: { key: string }) => {
      const newPopupList = popupList.map((p) =>
        p.key === key
          ? {
              ...p,
              show: false,
            }
          : p,
      );
      setPopupList(newPopupList);
    },
    [setPopupList, popupList],
  );

  return {
    blockNumbers,
    isAvailableHashpack,
    selectedPoolId,
    openModal,
    popupList,
    wallets,
    updateBlockNumber,
    setAvailableHashpack,
    setSelectedPooId,
    setOpenModal,
    setWallets,
    addPopup,
    removePopup,
  };
}
