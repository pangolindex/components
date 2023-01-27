/* eslint-disable max-lines */
import { parseBytes32String } from '@ethersproject/strings';
import { CAVAX, Currency, Token } from '@pangolindex/sdk';
import { useEffect, useMemo, useState } from 'react';
import { useQueries, useQuery } from 'react-query';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useSelectedTokenList } from 'src/state/plists/hooks';
import { NEVER_RELOAD, useMultipleContractSingleData, useSingleCallResult } from 'src/state/pmulticall/hooks';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { useUserAddedTokens } from 'src/state/puser/hooks';
import { isAddress } from 'src/utils';
import { hederaFn } from 'src/utils/hedera';
import { NearTokenMetadata, nearFn } from 'src/utils/near';
import ERC20_INTERFACE, { ERC20_BYTES32_INTERFACE } from '../constants/abis/erc20';
import { useTokenHook } from './multiChainsHooks';
import { useBytes32TokenContract, useTokenContract } from './useContract';

export type TokenReturnType = Token | undefined | null;

export function useAllTokens(): { [address: string]: Token } {
  const chainId = useChainId();

  const userAddedTokens = useUserAddedTokens();
  const allTokens = useSelectedTokenList();
  return useMemo(() => {
    if (!chainId) return {};
    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: Token }>(
          (tokenMap, token) => {
            tokenMap[token.address] = token;
            return tokenMap;
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          { ...allTokens[chainId] },
        )
    );
  }, [chainId, userAddedTokens, allTokens]);
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;
function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : bytes32 && BYTES32_REGEX.test(bytes32)
    ? parseBytes32String(bytes32)
    : defaultValue;
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): TokenReturnType {
  const chainId = useChainId();

  const tokens = useAllTokens();

  const address = isAddress(tokenAddress);

  const tokenContract = useTokenContract(address ? address : undefined, false);
  const tokenContractBytes32 = useBytes32TokenContract(address ? address : undefined, false);
  const token: Token | undefined = address ? tokens[address] : undefined;

  const tokenName = useSingleCallResult(token ? undefined : tokenContract, 'name', undefined, NEVER_RELOAD);
  const tokenNameBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    'name',
    undefined,
    NEVER_RELOAD,
  );
  const symbol = useSingleCallResult(token ? undefined : tokenContract, 'symbol', undefined, NEVER_RELOAD);
  const symbolBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    'symbol',
    undefined,
    NEVER_RELOAD,
  );
  const decimals = useSingleCallResult(token ? undefined : tokenContract, 'decimals', undefined, NEVER_RELOAD);

  return useMemo(() => {
    if (token) return token;
    if (!chainId || !address) return undefined;
    if (decimals.loading || symbol.loading || tokenName.loading) return null;
    if (decimals.result) {
      return new Token(
        chainId,
        address,
        decimals.result[0],
        parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], 'UNKNOWN'),
        parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], 'Unknown Token'),
      );
    }
    return undefined;
  }, [
    address,
    chainId,
    decimals.loading,
    decimals.result,
    symbol.loading,
    symbol.result,
    symbolBytes32.result,
    token,
    tokenName.loading,
    tokenName.result,
    tokenNameBytes32.result,
  ]);
}

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

export function useTokens(tokensAddress: string[] = []): Array<TokenReturnType> | undefined | null {
  const chainId = useChainId();
  const tokens = useAllTokens();

  const tokensName = useMultipleContractSingleData(tokensAddress, ERC20_INTERFACE, 'name', undefined, NEVER_RELOAD);
  const tokensNameBytes32 = useMultipleContractSingleData(
    tokensAddress,
    ERC20_BYTES32_INTERFACE,
    'name',
    undefined,
    NEVER_RELOAD,
  );
  const symbols = useMultipleContractSingleData(tokensAddress, ERC20_INTERFACE, 'symbol', undefined, NEVER_RELOAD);
  const symbolsBytes32 = useMultipleContractSingleData(
    tokensAddress,
    ERC20_BYTES32_INTERFACE,
    'symbol',
    undefined,
    NEVER_RELOAD,
  );
  const decimals = useMultipleContractSingleData(tokensAddress, ERC20_INTERFACE, 'decimals', undefined, NEVER_RELOAD);

  return useMemo(() => {
    if (!tokensAddress || tokensAddress?.length === 0) return [];
    if (!chainId) return [];

    return tokensAddress.reduce<Token[]>((acc, tokenAddress, index) => {
      const tokenName = tokensName?.[index];
      const tokenNameBytes32 = tokensNameBytes32?.[index];
      const symbol = symbols?.[index];
      const symbolBytes32 = symbolsBytes32?.[index];
      const decimal = decimals?.[index];
      const address = isAddress(tokenAddress);

      if (!!address && tokens[address]) {
        // if we have user tokens already
        acc.push(tokens[address]);
      } else if (
        tokenName?.loading === false &&
        tokenNameBytes32?.loading === false &&
        symbol?.loading === false &&
        symbolBytes32?.loading === false &&
        decimal?.loading === false &&
        address &&
        decimal?.result?.[0]
      ) {
        const token = new Token(
          chainId,
          address,
          decimal?.result?.[0],
          parseStringOrBytes32(symbol?.result?.[0], symbolBytes32?.result?.[0], 'UNKNOWN'),
          parseStringOrBytes32(tokenName?.result?.[0], tokenNameBytes32?.result?.[0], 'Unknown Token'),
        );

        acc.push(token);
      }

      return acc;
    }, []);
  }, [chainId, decimals, symbols, symbolsBytes32, tokensName, tokensNameBytes32, tokens, tokensAddress]);
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

export function useCurrency(currencyId: string | undefined): Currency | null | undefined {
  const chainId = useChainId();
  const isAVAX = currencyId?.toUpperCase() === CAVAX[chainId].symbol?.toUpperCase();
  const useToken_ = useTokenHook[chainId];
  const token = useToken_(isAVAX ? undefined : currencyId);
  return isAVAX ? chainId && CAVAX[chainId] : token;
}

/**
 * to get all hedera associated tokens
 * @params dependancies on which use query should refetch data
 * @returns all associated tokens
 */
export function useGetAllHederaAssociatedTokens(dependancies = [] as any[]) {
  const chainId = useChainId();

  const { account } = usePangolinWeb3();

  const response = useQuery(['check-hedera-token-associated', account, ...dependancies], async () => {
    if (!account || !hederaFn.isHederaChain(chainId)) return;
    const tokens = await hederaFn.getAccountAssociatedTokens(account);
    return tokens;
  });

  return response;
}

/**
 * this hook is useful to get token is associated or not and method to make that token associated
 * @param address
 * @param symbol
 * @returns  associate function, isLoading, hederaAssociated
 */
export function useHederaTokenAssociated(
  address: string | undefined,
  symbol: string | undefined,
): {
  associate: undefined | (() => Promise<void>);
  isLoading: boolean;
  hederaAssociated: boolean;
} {
  const { account } = usePangolinWeb3();
  const addTransaction = useTransactionAdder();
  const chainId = useChainId();

  const [loading, setLoading] = useState(false);

  const { data: tokens, isLoading, refetch } = useGetAllHederaAssociatedTokens();

  const currencyId = address ? hederaFn.hederaId(address) : '';

  const isAssociated = !!(tokens || []).find((token) => token.tokenId === currencyId);

  return useMemo(() => {
    return {
      associate:
        account && address
          ? async () => {
              try {
                setLoading(true);
                const txReceipt = await hederaFn.tokenAssociate(address, account);
                if (txReceipt) {
                  refetch();
                  addTransaction(txReceipt, { summary: `${symbol} successfully  associated` });
                }
                setLoading(false);
              } catch (error) {
                setLoading(false);
                console.error('Could not deposit', error);
              }
            }
          : undefined,
      isLoading: loading,
      hederaAssociated: isAssociated,
    };
  }, [chainId, address, symbol, account, loading, isLoading, isAssociated]);
}

/**
 * this hook is useful to filter filter tokens which is not associated
 * @param tokens
 * @returns not associated tokens array
 */
export function useGetHederaTokenNotAssociated(tokens: Array<Token> | undefined): Array<Token> {
  const { account } = usePangolinWeb3();

  const { data, isLoading } = useGetAllHederaAssociatedTokens();

  return useMemo(() => {
    return (tokens || []).reduce<Array<Token>>((memo, token) => {
      if (token?.address) {
        const currencyId = account ? hederaFn.hederaId(token?.address) : '';

        const isAssociated = (data || []).find((item) => item.tokenId === currencyId);

        if (!isAssociated) {
          memo.push(token);
        }
      }

      return memo;
    }, []);
  }, [data, isLoading, tokens]);
}

/* eslint-enable max-lines */
