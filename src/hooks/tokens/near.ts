import { Token } from '@pangolindex/sdk';
import { useEffect, useMemo, useState } from 'react';
import { useQueries } from 'react-query';
import { useChainId } from 'src/hooks';
import { NearTokenMetadata, nearFn } from 'src/utils/near';
import { useAllTokens } from '../useAllTokens';
import { TokenReturnType } from './constant';

export function useNearToken(tokenAddress?: string): TokenReturnType {
  const [tokenData, setTokenData] = useState<NearTokenMetadata>();

  const chainId = useChainId();
  const tokens = useAllTokens();

  const address = tokenAddress;

  const token: Token | undefined = address ? tokens[address] : undefined;

  useEffect(() => {
    async function getTokenData() {
      if (address) {
        const tokenMetaData = await nearFn.getMetadata(address);

        setTokenData(tokenMetaData);
      }
    }

    getTokenData();
  }, [address]);

  return useMemo(() => {
    if (token) return token;
    if (!chainId || !address) return undefined;

    if (tokenData) {
      return new Token(chainId, address, tokenData?.decimals, tokenData?.symbol, tokenData?.name);
    }

    return undefined;
  }, [address, chainId, token, tokenData]);
}

const fetchNearTokenMetadata = (address) => () => {
  return nearFn.getMetadata(address);
};

export function useNearTokens(tokensAddress: string[] = []): Array<TokenReturnType> | undefined | null {
  const chainId = useChainId();
  const tokens = useAllTokens();

  const queryParameter = useMemo(() => {
    return (
      tokensAddress?.map((address) => {
        return { queryKey: ['token', address], queryFn: fetchNearTokenMetadata(address) };
      }) ?? []
    );
  }, [tokensAddress]);

  const results = useQueries(queryParameter);

  return useMemo(() => {
    if (!tokensAddress || tokensAddress?.length === 0) return [];
    if (!chainId) return [];

    return results.reduce<Token[]>((acc, result) => {
      const tokenData = result?.data;

      if (tokenData && result?.isLoading === false) {
        if (!!tokenData?.id && tokens[tokenData?.id]) {
          // if we have user tokens already
          acc.push(tokens[tokenData?.id]);
        } else {
          const token = new Token(chainId, tokenData?.id, tokenData?.decimals, tokenData?.symbol, tokenData?.name);

          acc.push(token);
        }
      }

      return acc;
    }, []);
  }, [results, tokens]);
}
