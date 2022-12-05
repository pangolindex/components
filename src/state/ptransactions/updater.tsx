import { ChainId } from '@pangolindex/sdk';
import { AnyAction } from '@reduxjs/toolkit';
import { Dispatch, useEffect } from 'react';
import { useDummyHook } from 'src/hooks/multiChainsHooks';
import { AppState, useDispatch, useSelector } from 'src/state';
import { nearFn } from 'src/utils/near';
import { useChainId, useLibrary } from '../../hooks';
import { useAddPopup, useBlockNumber } from '../papplication/hooks';
import { addTransaction, checkedTransaction, finalizeTransaction } from './actions';
import { TransactionDetails } from './reducer';

export function shouldCheck(
  lastBlockNumber: number,
  tx: {
    addedTime: number;
    receipt?: {
      /* */
    };
    lastCheckedBlockNumber?: number;
  },
  chainId: ChainId,
): boolean {
  if (!shouldCheckMapping[chainId]) {
    return true;
  }
  if (!tx.lastCheckedBlockNumber) return true;
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber;
  if (blocksSinceCheck < 1) return false;
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60;
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9;
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2;
  } else {
    // otherwise every block
    return true;
  }
}

type TxCheckerProps = {
  transactions: {
    [txHash: string]: TransactionDetails;
  };
  dispatch: Dispatch<AnyAction>;
  chainId: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const txChecker = (_params: TxCheckerProps) => {
  // This is intentional as this is just dummy function to support for evm chains
};

const NEAR_TX_HASH_PARAM = 'transactionHashes';
/**
 * this method is used to check transaction hashes in url and if found then get summary of that transaction and add it to the reducer
 * @returns txChecker function
 */
const nearTxChecker = async ({ transactions, dispatch, chainId }) => {
  const search = window.location.search;
  // get transactionHashes from url
  const txHashes = new URLSearchParams(search).get(NEAR_TX_HASH_PARAM)?.split(',') || [];
  const txHash = txHashes?.length > 0 ? txHashes?.[txHashes?.length - 1] : '';
  if (txHash) {
    // get tx details using near sdk
    const tx = await nearFn?.getTransaction(txHash);
    if (tx) {
      // get tx summary
      const summary = nearFn.getTranctionSummary(tx);
      const exists = !!transactions[txHash];
      // if hash doesn't exist then only add it to redux
      if (!exists) {
        dispatch(addTransaction({ hash: txHash, from: nearFn.getAccountId(), chainId, summary }));
      }
    }

    // remove transactionHashes from url without refreshing page
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete(NEAR_TX_HASH_PARAM);
    window.history.replaceState({}, document.title, currentUrl.toString());
  }
};

const txCheckerMapping: { [chainId in ChainId]: (params: TxCheckerProps) => void } = {
  [ChainId.AVALANCHE]: txChecker,
  [ChainId.FUJI]: txChecker,
  [ChainId.COSTON]: txChecker,
  [ChainId.SONGBIRD]: txChecker,
  [ChainId.HEDERA_TESTNET]: txChecker,
  [ChainId.WAGMI]: txChecker,
  [ChainId.NEAR_MAINNET]: nearTxChecker,
  [ChainId.NEAR_TESTNET]: nearTxChecker,
  [ChainId.ETHEREUM]: useDummyHook,
  [ChainId.POLYGON]: useDummyHook,
  [ChainId.FANTOM]: useDummyHook,
  [ChainId.XDAI]: useDummyHook,
  [ChainId.BSC]: useDummyHook,
  [ChainId.ARBITRUM]: useDummyHook,
  [ChainId.CELO]: useDummyHook,
  [ChainId.OKXCHAIN]: useDummyHook,
  [ChainId.VELAS]: useDummyHook,
  [ChainId.AURORA]: useDummyHook,
  [ChainId.CRONOS]: useDummyHook,
  [ChainId.FUSE]: useDummyHook,
  [ChainId.MOONRIVER]: useDummyHook,
  [ChainId.MOONBEAM]: useDummyHook,
  [ChainId.OP]: useDummyHook,
};

const shouldCheckMapping: { [chainId in ChainId]: boolean } = {
  [ChainId.AVALANCHE]: true,
  [ChainId.FUJI]: true,
  [ChainId.COSTON]: true,
  [ChainId.SONGBIRD]: true,
  [ChainId.HEDERA_TESTNET]: false,
  [ChainId.WAGMI]: true,
  [ChainId.NEAR_MAINNET]: true,
  [ChainId.NEAR_TESTNET]: true,
  //TODO: remove this once we have proper implementation
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
};

export default function Updater(): null {
  const chainId = useChainId();
  const { library, provider } = useLibrary();

  const lastBlockNumber = useBlockNumber();

  const dispatch = useDispatch();
  const state = useSelector<AppState['ptransactions']>((state) => state.ptransactions);

  const transactions = chainId ? state[chainId] ?? {} : {}; // eslint-disable-line react-hooks/exhaustive-deps

  const txCheckerFn = txCheckerMapping[chainId as ChainId];

  // as of now this is specific to Near chain, we are checking user is coming to pangolin after completing tx or not
  useEffect(() => {
    if (txCheckerFn) {
      txCheckerFn({ transactions, chainId, dispatch });
    }
  }, [transactions, chainId, dispatch]);

  // show popup on confirm
  const addPopup = useAddPopup();

  useEffect(() => {
    if (!chainId || !library || !lastBlockNumber) return;

    Object.keys(transactions)
      .filter((hash) => !transactions[hash].receipt)
      .filter((hash) => shouldCheck(lastBlockNumber, transactions[hash], chainId))
      .forEach(async (hash) => {
        try {
          const receipt = await (provider as any).getTransactionReceipt(hash);

          const status = receipt?.status;

          if (receipt) {
            dispatch(
              finalizeTransaction({
                chainId,
                hash,
                receipt: {
                  blockHash: receipt.blockHash,
                  blockNumber: receipt?.blockNumber,
                  // contractAddress: receipt.contractAddress,
                  contractAddress: '',
                  from: receipt.from,
                  status,
                  to: receipt.to,
                  // transactionHash: receipt.transactionHash,
                  transactionHash: receipt.hash,
                  transactionIndex: receipt.transactionIndex,
                },
              }),
            );

            addPopup(
              {
                txn: {
                  hash,
                  success: status === 1,
                  summary: transactions[hash]?.summary,
                },
              },
              hash,
            );
          } else {
            dispatch(checkedTransaction({ chainId, hash, blockNumber: lastBlockNumber }));
          }
        } catch (error) {
          console.error(`failed to check transaction hash: ${hash}`, error);
        }
      });
  }, [chainId, library, transactions, lastBlockNumber, dispatch, addPopup]);

  return null;
}
