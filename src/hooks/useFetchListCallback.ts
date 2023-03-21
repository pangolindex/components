import { TokenList } from '@pangolindex/token-lists';
import { nanoid } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useListsStateAtom } from 'src/state/plists/atom';
import getTokenList from 'src/utils/getTokenList';

export function useFetchListCallback(): (listUrl: string) => Promise<TokenList> {
  const { pendingFetchTokenList, fulfilledFetchTokenList, rejectedFetchTokenList } = useListsStateAtom();

  const ensResolver = useCallback(() => {
    throw new Error('Could not construct mainnet ENS resolver');
  }, []);

  return useCallback(
    async (listUrl: string) => {
      const requestId = nanoid();

      pendingFetchTokenList({ requestId, url: listUrl });
      return getTokenList(listUrl, ensResolver)
        .then((tokenList) => {
          fulfilledFetchTokenList({ url: listUrl, tokenList, requestId });

          return tokenList;
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error);
          rejectedFetchTokenList({ url: listUrl, requestId, errorMessage: error.message });
          throw error;
        });
    },
    [pendingFetchTokenList, fulfilledFetchTokenList, rejectedFetchTokenList, ensResolver],
  );
}
