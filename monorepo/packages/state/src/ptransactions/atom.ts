import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useCallback } from 'react';

export interface SerializableTransactionReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  blockHash: string;
  transactionHash: string;
  blockNumber: number;
  status?: number;
}

const now = () => new Date().getTime();

export interface TransactionDetails {
  hash: string;
  approval?: { tokenAddress: string; spender: string };
  summary?: string;
  claim?: { recipient: string };
  receipt?: SerializableTransactionReceipt;
  lastCheckedBlockNumber?: number;
  addedTime: number;
  confirmedTime?: number;
  from: string;
}

export interface AddTransactionDetails {
  chainId: number;
  from: string;
  hash: string;
  approval?: { tokenAddress: string; spender: string };
  summary?: string;
  claim?: { recipient: string };
}
export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails;
  };
}

const localstorageKey = 'transaction_pangolin';
const transactionAtom = atomWithStorage<TransactionState>(localstorageKey, {});

export function useTransactionState() {
  const [transactions, setTransactions] = useAtom(transactionAtom);

  const addTransaction = useCallback(
    ({ chainId, from, hash, approval, summary, claim }: AddTransactionDetails) => {
      if (transactions[chainId]?.[hash]) {
        return;
      }
      const txs = transactions[chainId] ?? {};
      txs[hash] = { hash, approval, summary, claim, from, addedTime: now() };
      setTransactions({ ...transactions, [chainId]: txs });
    },
    [setTransactions, transactions],
  );

  const clearAllTransactions = useCallback(
    ({ chainId }: { chainId: number }) => {
      if (!transactions[chainId]) return;
      setTransactions({ ...transactions, [chainId]: {} });
    },
    [setTransactions, transactions],
  );

  const checkedTransaction = useCallback(
    ({ chainId, hash, blockNumber }: { chainId: number; hash: string; blockNumber: number }) => {
      const tx = transactions[chainId]?.[hash];
      if (!tx) {
        return;
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber;
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber);
      }
      setTransactions({ ...transactions });
    },
    [setTransactions, transactions],
  );

  const finalizeTransaction = useCallback(
    ({ hash, chainId, receipt }: { chainId: number; hash: string; receipt: SerializableTransactionReceipt }) => {
      const tx = transactions[chainId]?.[hash];

      if (!tx) {
        return;
      }
      tx.receipt = receipt;
      tx.confirmedTime = now();
      setTransactions({ ...transactions });
    },
    [setTransactions, transactions],
  );

  return {
    transactions,
    addTransaction,
    clearAllTransactions,
    checkedTransaction,
    finalizeTransaction,
  };
}
