import { uriToHttp } from '@honeycomb-finance/shared';
import { TokenList } from '@pangolindex/token-lists';
import schema from '@pangolindex/token-lists/src/tokenlist.schema.json';
import { nanoid } from '@reduxjs/toolkit';
import Ajv from 'ajv';
import { useCallback } from 'react';
import { useListsStateAtom } from 'src/state/lists/atom';

const tokenListValidator = new Ajv({ allErrors: true }).compile(schema);

/**
 * Contains the logic for resolving a list URL to a validated token list
 * @param listUrl list url
 * @param resolveENSContentHash resolves an ens name to a contenthash
 */
export default async function getTokenList(
  listUrl: string,
  resolveENSContentHash: (ensName: string) => Promise<string>, // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<TokenList> {
  const urls: string[] = uriToHttp(listUrl);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const isLast = i === urls.length - 1;
    let response;
    try {
      response = await fetch(url);
    } catch (error) {
      console.debug('Failed to fetch list', listUrl, error);
      if (isLast) throw new Error(`Failed to download list ${listUrl}`);
      continue;
    }

    if (!response.ok) {
      if (isLast) throw new Error(`Failed to download list ${listUrl}`);
      continue;
    }

    const json = await response.json();

    if (!tokenListValidator(json)) {
      const validationErrors: string =
        tokenListValidator.errors?.reduce<string>((memo, error) => {
          const add = `${error.dataPath} ${error.message ?? ''}`;
          return memo.length > 0 ? `${memo}; ${add}` : `${add}`;
        }, '') ?? 'unknown error';
      throw new Error(`Token list failed validation: ${validationErrors}`);
    }

    return json;
  }
  throw new Error('Unrecognized list URL protocol.');
}

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
