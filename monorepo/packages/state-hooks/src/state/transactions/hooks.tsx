import { TransactionResponse } from '@ethersproject/providers';
import { useChainId, usePangolinWeb3 } from '@honeycomb-finance/shared';
import { useCallback, useMemo } from 'react';
import { TransactionDetails, useTransactionState } from './atom';

type TransactionOnlyWithHash = Pick<TransactionResponse, 'hash'>;

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: TransactionOnlyWithHash,
  customData?: {
    summary?: string;
    approval?: { tokenAddress: string; spender: string };
    claim?: { recipient: string };
  },
) => void {
  const { chainId, account } = usePangolinWeb3();
  const { addTransaction } = useTransactionState();

  return useCallback(
    (
      response: TransactionOnlyWithHash,
      {
        summary,
        approval,
        claim,
      }: { summary?: string; claim?: { recipient: string }; approval?: { tokenAddress: string; spender: string } } = {},
    ) => {
      if (!account) return;
      if (!chainId) return;

      const { hash } = response;
      if (!hash) {
        throw Error('No transaction hash found.');
      }
      addTransaction({ hash, from: account, chainId, approval, summary, claim });
    },
    [addTransaction, chainId, account],
  );
}

export function useAllTransactionsClearer() {
  const chainId = useChainId();
  const { clearAllTransactions } = useTransactionState();
  return useCallback(() => {
    clearAllTransactions({ chainId });
  }, [chainId, clearAllTransactions]);
}

// returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: TransactionDetails } {
  const { chainId } = usePangolinWeb3();
  const { transactions } = useTransactionState();
  const state = transactions;

  return chainId ? state[chainId] ?? {} : {};
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions();

  if (!transactionHash || !transactions[transactionHash]) return false;

  return !transactions[transactionHash].receipt;
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000;
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(tokenAddress: string | undefined, spender: string | undefined): boolean {
  const allTransactions = useAllTransactions();
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash];
        if (!tx) return false;
        if (tx.receipt) {
          return false;
        } else {
          const approval = tx.approval;
          if (!approval) return false;
          return approval.spender === spender && approval.tokenAddress === tokenAddress && isTransactionRecent(tx);
        }
      }),
    [allTransactions, spender, tokenAddress],
  );
}

// watch for submissions to claim
// return null if not done loading, return undefined if not found
export function useUserHasSubmittedClaim(account?: string): {
  claimSubmitted: boolean;
  claimTxn: TransactionDetails | undefined;
} {
  const allTransactions = useAllTransactions();

  // get the txn if it has been submitted
  const claimTxn = useMemo(() => {
    const txnIndex = Object.keys(allTransactions).find((hash) => {
      const tx = allTransactions[hash];
      return tx.claim && tx.claim.recipient === account;
    });
    return txnIndex && allTransactions[txnIndex] ? allTransactions[txnIndex] : undefined;
  }, [account, allTransactions]);

  return { claimSubmitted: Boolean(claimTxn), claimTxn };
}
