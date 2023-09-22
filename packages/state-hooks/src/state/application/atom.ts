import { ChainId } from '@pangolindex/sdk';
import { TokenList } from '@pangolindex/token-lists';
import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';

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
  DELEGATE,
  VOTE,
}

export type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>;

export interface ApplicationState {
  readonly blockNumbers: { readonly [chainId: number]: number };
  readonly popupList: PopupList;
  readonly openModal: ApplicationModal | null;
  readonly selectedPoolId: string | undefined;
  readonly isAvailableHashpack: boolean;

  readonly useSubgraph: {
    [ChainId.FUJI]: boolean;
    [ChainId.AVALANCHE]: boolean;
    [ChainId.WAGMI]: boolean;
    [ChainId.COSTON]: boolean;
    [ChainId.SONGBIRD]: boolean;
    [ChainId.FLARE_MAINNET]: boolean;
    [ChainId.HEDERA_TESTNET]: boolean;
    [ChainId.HEDERA_MAINNET]: boolean;
    [ChainId.NEAR_MAINNET]: boolean;
    [ChainId.NEAR_TESTNET]: boolean;
    [ChainId.COSTON2]: boolean;
    [ChainId.ETHEREUM]: boolean;
    [ChainId.POLYGON]: boolean;
    [ChainId.FANTOM]: boolean;
    [ChainId.XDAI]: boolean;
    [ChainId.BSC]: boolean;
    [ChainId.ARBITRUM]: boolean;
    [ChainId.CELO]: boolean;
    [ChainId.OKXCHAIN]: boolean;
    [ChainId.VELAS]: boolean;
    [ChainId.AURORA]: boolean;
    [ChainId.CRONOS]: boolean;
    [ChainId.FUSE]: boolean;
    [ChainId.MOONRIVER]: boolean;
    [ChainId.MOONBEAM]: boolean;
    [ChainId.OP]: boolean;
    [ChainId.EVMOS_TESTNET]: boolean;
    [ChainId.EVMOS_MAINNET]: boolean;
    [ChainId.SKALE_BELLATRIX_TESTNET]: boolean;
  };

  readonly walletModalChainId: number | undefined;
}

const useSubgraphInitialState = {
  [ChainId.FUJI]: false,
  [ChainId.AVALANCHE]: false,
  [ChainId.WAGMI]: false,
  [ChainId.COSTON]: false,
  [ChainId.SONGBIRD]: false,
  [ChainId.FLARE_MAINNET]: false,
  [ChainId.HEDERA_TESTNET]: true,
  [ChainId.HEDERA_MAINNET]: true,
  [ChainId.NEAR_MAINNET]: false,
  [ChainId.NEAR_TESTNET]: false,
  [ChainId.COSTON2]: false,
  [ChainId.ETHEREUM]: false,
  [ChainId.POLYGON]: false,
  [ChainId.FANTOM]: false,
  [ChainId.XDAI]: false,
  [ChainId.BSC]: false,
  [ChainId.ARBITRUM]: false,
  [ChainId.CELO]: false,
  [ChainId.OKXCHAIN]: false,
  [ChainId.VELAS]: false,
  [ChainId.AURORA]: false,
  [ChainId.CRONOS]: false,
  [ChainId.FUSE]: false,
  [ChainId.MOONRIVER]: false,
  [ChainId.MOONBEAM]: false,
  [ChainId.OP]: false,
  [ChainId.EVMOS_TESTNET]: false,
  [ChainId.EVMOS_MAINNET]: false,
  [ChainId.SKALE_BELLATRIX_TESTNET]: false,
};

const blockNumbersAtom = atom<ApplicationState['blockNumbers']>({});
const popupListAtom = atom<ApplicationState['popupList']>([]);
const openModalAtom = atom<ApplicationState['openModal']>(null);
const selectedPoolIdAtom = atom<ApplicationState['selectedPoolId']>(undefined);
const isAvailableHashpackAtom = atom<ApplicationState['isAvailableHashpack']>(false);
const subgraphLocalstorageKey = 'subgraph_pangolin_storage';
const useSubgraphAtom = atomWithStorage<ApplicationState['useSubgraph']>(
  subgraphLocalstorageKey,
  useSubgraphInitialState,
);
const walletModalChainIdAtom = atom<ApplicationState['walletModalChainId']>(undefined);

export function useApplicationState() {
  const [blockNumbers, setBlockNumbers] = useAtom(blockNumbersAtom);
  const [popupList, setPopupList] = useAtom(popupListAtom);
  const [openModal, setOpenModal] = useAtom(openModalAtom);
  const [selectedPoolId, setSelectedPooId] = useAtom(selectedPoolIdAtom);
  const [isAvailableHashpack, setAvailableHashpack] = useAtom(isAvailableHashpackAtom);

  const [useSubgraph, setUseSubgraph] = useAtom(useSubgraphAtom);
  const [walletModalChainId, setWalletModalChainId] = useAtom(walletModalChainIdAtom);

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
    useSubgraph,
    walletModalChainId,
    updateBlockNumber,
    setAvailableHashpack,
    setSelectedPooId,
    setOpenModal,
    addPopup,
    removePopup,
    setUseSubgraph,
    setWalletModalChainId,
  };
}
