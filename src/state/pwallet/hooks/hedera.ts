/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { CAVAX, ChainId, Currency, JSBI, Pair, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries, useQuery } from 'react-query';
import { usePair, usePairs } from 'src/data/Reserves';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { useGetAllHederaAssociatedTokens, useHederaTokenAssociated } from 'src/hooks/tokens/hedera';
import { useHederaFn } from 'src/hooks/useConnector';
import { useBlockNumber } from 'src/state/papplication/hooks';
import { Field } from 'src/state/pburn/atom';
import { Field as AddField } from 'src/state/pmint/atom';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { calculateSlippageAmount, getRouterContract, isAddress } from 'src/utils';
import { Hedera, HederaTokenMetadata } from 'src/utils/hedera';
import { unwrappedToken, wrappedCurrency } from 'src/utils/wrappedCurrency';
import { useTrackedTokenPairs } from '../../puser/hooks';
import { AddLiquidityProps, AttemptToApproveProps, CreatePoolProps, RemoveLiquidityProps } from '../types';

/**
 * Returns a Hedera Wallet balance.
 */
export function useHederaBalance(
  chainId: ChainId,
  accounts?: (string | undefined)[],
): { [address: string]: TokenAmount | undefined } | undefined {
  const [hederaBalance, setHederaBalance] = useState<{ [address: string]: TokenAmount | undefined }>();

  const hederaToken = WAVAX[chainId];
  const hederaFn = useHederaFn();

  useEffect(() => {
    async function checkHederaBalance() {
      if (accounts?.[0]) {
        const balance = await hederaFn.getAccountBalance(accounts?.[0]);

        const hederaTokenBalance = new TokenAmount(hederaToken, balance);

        const container = {} as { [address: string]: TokenAmount | undefined };
        container[accounts?.[0]] = hederaTokenBalance;

        setHederaBalance(container);
      }
    }

    checkHederaBalance();
  }, [accounts, chainId]);

  return useMemo(() => hederaBalance, [hederaBalance]);
}

export function useHederaTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[],
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const latestBlockNumber = useBlockNumber();

  const hederaFn = useHederaFn();

  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens],
  );

  const { data, isLoading } = useGetAllHederaAssociatedTokens([latestBlockNumber]);

  const balances = useMemo(() => {
    return (data || []).reduce<{ [tokenAddress: string]: string }>((memo, token) => {
      const address = hederaFn.idToAddress(token?.tokenId);

      if (address) {
        memo[address] = token.balance;
      }
      return memo;
    }, {});
  }, [data]);

  const tokenBalances = useMemo(
    () =>
      address && validatedTokens.length > 0
        ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token) => {
            const value = token?.address ? balances[token.address] : 0;
            const amount = value ? JSBI.BigInt(value.toString()) : JSBI.BigInt(0);
            memo[token.address] = new TokenAmount(token, amount);
            return memo;
          }, {})
        : {},
    [address, validatedTokens, balances],
  );

  return [tokenBalances, isLoading];
}

export function useHederaTokenBalance(account?: string, token?: Token): TokenAmount | undefined {
  const [tokenBalances] = useHederaTokenBalances(account, [token]);
  if (!token) return undefined;
  return tokenBalances[token.address];
}

/**
 * This hook used to get balance for given Hedera pair
 * Takes account and pair as a input and return liquidityTokenAddress wise balance
 * @param account
 * @param pair
 * @returns {[tokenAddress: string]: TokenAmount | undefined;}
 */
export function useHederaPairBalances(account?: string, pairs?: (Pair | undefined)[]) {
  const pglTokens = useHederaPGLTokens(pairs);

  const liquidityTokens = useMemo(
    () =>
      pglTokens.map((pglToken) => {
        return pglToken[0];
      }),
    [pglTokens],
  );

  const [v2PairsBalances, fetchingV2PairBalances] = useHederaTokenBalances(account ?? undefined, liquidityTokens);

  const newV2PairsBalances = useMemo(
    () =>
      Object.keys(v2PairsBalances).length > 0
        ? pglTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, pglToken) => {
            const pglTokenData = pglToken[0];
            const liquidityToken = pglToken[1];

            const isExitPairBalance = Object.keys(v2PairsBalances).find((address) => address === pglTokenData?.address);

            if (
              isExitPairBalance &&
              liquidityToken &&
              pglTokenData &&
              v2PairsBalances[pglTokenData?.address]?.raw?.toString()
            ) {
              memo[liquidityToken?.address] = new TokenAmount(
                liquidityToken,
                v2PairsBalances[pglTokenData?.address]?.raw?.toString() ?? JSBI.BigInt(0),
              );
            }
            return memo;
          }, {})
        : {},
    [v2PairsBalances],
  );

  return [newV2PairsBalances, fetchingV2PairBalances];
}

// get the balance for a single pair combo
export function useHederaPairBalance(account?: string, pair?: Pair): TokenAmount | undefined {
  const [v2PairsBalances, fetchingV2PairBalances] = useHederaPairBalances(account, [pair]);

  if (!pair || fetchingV2PairBalances) {
    return undefined;
  }
  return v2PairsBalances[pair?.liquidityToken?.address];
}

export function useHederaAddLiquidity() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const addTransaction = useTransactionAdder();
  const hederaFn = useHederaFn();

  return async (data: AddLiquidityProps) => {
    if (!chainId || !library || !account) return;

    const { parsedAmounts, deadline, noLiquidity, allowedSlippage, currencies } = data;

    const { CURRENCY_A: currencyA, CURRENCY_B: currencyB } = currencies;

    const { [AddField.CURRENCY_A]: parsedAmountA, [AddField.CURRENCY_B]: parsedAmountB } = parsedAmounts;
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
      return;
    }

    const amountsMin = {
      [AddField.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [AddField.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0],
    };

    const poolExists = false;
    let response;
    try {
      if (currencyA === CAVAX[chainId] || currencyB === CAVAX[chainId]) {
        const tokenBIsETH = currencyB === CAVAX[chainId];

        const args = {
          token: wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId), // token
          tokenAmount: (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
          HBARAmount: (tokenBIsETH ? parsedAmountB : parsedAmountA).toExact(), // HBAR desired
          tokenAmountMin: amountsMin[tokenBIsETH ? AddField.CURRENCY_A : AddField.CURRENCY_B].toString(), // token min
          HBARAmountMin: amountsMin[tokenBIsETH ? AddField.CURRENCY_B : AddField.CURRENCY_A].toString(), // eth min
          account: account,
          poolExists: poolExists,
          deadline: deadline.toNumber(),
          chainId: chainId,
        };

        response = await hederaFn.addNativeLiquidity(args);
      } else {
        const args = {
          tokenA: wrappedCurrency(currencyA, chainId),
          tokenB: wrappedCurrency(currencyB, chainId),
          tokenAAmount: parsedAmountA.raw.toString(),
          tokenBAmount: parsedAmountB.raw.toString(),
          tokenAAmountMin: amountsMin[AddField.CURRENCY_A].toString(),
          tokenBAmountMin: amountsMin[AddField.CURRENCY_B].toString(),
          account,
          poolExists,
          deadline: deadline.toNumber(),
          chainId,
        };

        response = await hederaFn.addLiquidity(args);
      }

      addTransaction(response, {
        summary:
          'Added ' +
          parsedAmounts[AddField.CURRENCY_A]?.toSignificant(3) +
          ' ' +
          currencies[AddField.CURRENCY_A]?.symbol +
          ' and ' +
          parsedAmounts[AddField.CURRENCY_B]?.toSignificant(3) +
          ' ' +
          currencies[AddField.CURRENCY_B]?.symbol,
      });

      return response;
    } catch (err) {
      const _err = err as any;
      // we only care if the error is something _other_ than the user rejected the tx
      if (_err?.code !== 4001) {
        console.error(_err);
      }
    } finally {
      // This is intentional
    }
  };
}

export function useHederaRemoveLiquidity(pair?: Pair | null | undefined) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const addTransaction = useTransactionAdder();
  const { t } = useTranslation();
  const hederaFn = useHederaFn();

  const removeLiquidity = async (data: RemoveLiquidityProps) => {
    if (!chainId || !library || !account || !pair) return;

    const { parsedAmounts, deadline, allowedSlippage } = data;

    const router = getRouterContract(chainId, library, account);

    if (!chainId || !library || !account || !deadline || !router) throw new Error(t('error.missingDependencies'));
    const { [AddField.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts;

    const tokenA = pair?.token0;
    const tokenB = pair?.token1;
    const currencyA = tokenA ? unwrappedToken(tokenA, chainId) : undefined;
    const currencyB = tokenB ? unwrappedToken(tokenB, chainId) : undefined;

    if (!currencyAmountA || !currencyAmountB) {
      throw new Error(t('error.missingCurrencyAmounts'));
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
    };

    if (!currencyA || !currencyB) throw new Error(t('error.missingTokens'));
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    if (!liquidityAmount) throw new Error(t('error.missingLiquidityAmount'));

    if (!tokenA || !tokenB) throw new Error(t('error.couldNotWrap'));

    try {
      const args = {
        tokenA: wrappedCurrency(currencyA, chainId),
        tokenB: wrappedCurrency(currencyB, chainId),
        liquidityAmount: liquidityAmount.raw.toString(),
        tokenAAmountMin: amountsMin[AddField.CURRENCY_A].toString(),
        tokenBAmountMin: amountsMin[AddField.CURRENCY_B].toString(),
        account,
        deadline: deadline.toNumber(),
        chainId,
      };

      const response = await hederaFn.removeLiquidity(args);
      if (response) {
        addTransaction(response, {
          summary:
            'Removed' +
            ' ' +
            parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
            ' ' +
            currencyA?.symbol +
            ' and ' +
            parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
            ' ' +
            currencyB?.symbol,
        });

        return response;
      }
      return;
    } catch (err) {
      const _err = err as any;
      // we only care if the error is something _other_ than the user rejected the tx
      if (_err?.code !== 4001) {
        console.error(_err);
      }
    }
  };

  const onAttemptToApprove = async (data1: AttemptToApproveProps) => {
    const { approveCallback } = data1;
    approveCallback();
  };

  return { removeLiquidity, onAttemptToApprove, signatureData: null, setSignatureData: () => {} };
}

export function useGetHederaUserLP() {
  const chainId = useChainId();

  // get all pairs
  const trackedTokenPairs = useTrackedTokenPairs();
  const hederaFn = useHederaFn();

  // make lp address wise Tokens
  const pairTokens = useMemo(() => {
    return trackedTokenPairs.reduce<{ [liquidityAddress: string]: [Token, Token] }>((memo, [tokenA, tokenB]) => {
      const liquidityTokenAddress =
        tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB, chainId) : undefined;

      if (liquidityTokenAddress) {
        memo[liquidityTokenAddress] = [tokenA, tokenB];
      }
      return memo;
    }, {});
  }, [trackedTokenPairs, chainId]);

  // get liquidityTokenAddress array
  const lpTokenAddresses = Object.keys(pairTokens);

  // get liquidityTokenWise PGL(Fungible Token Address) mapping
  const pglTokenAddresses = useHederaPGLTokenAddresses(lpTokenAddresses);

  const { data, isLoading } = useGetAllHederaAssociatedTokens();
  // make pgltokenwise balance array
  const tokenBalances = useMemo(() => {
    return (data || []).reduce<{ [pglTokenAddress: string]: string }>((memo, token) => {
      const address = hederaFn.idToAddress(token?.tokenId);

      if (address) {
        memo[address] = token.balance;
      }
      return memo;
    }, {});
  }, [data]);

  //get the token metadata
  const tokensMetadata = useHederaTokensMetaData(Object.keys(tokenBalances));

  // filter to only fungible tokens
  // and we need to get token data to do filter based on PGL Symbol
  const allTokensAddress: string[] = useMemo(() => {
    const _allTokensAddress: string[] = [];
    Object.entries(tokensMetadata).forEach(([address, metadata]) => {
      if (metadata && metadata.type.startsWith('FUNGIBLE') && metadata.symbol === 'PGL') {
        return _allTokensAddress.push(address);
      }
    });
    return _allTokensAddress;
  }, [tokensMetadata]);

  // here we will filter pairTokens based on associated pgl Address has pgl address
  const filterPairTokens = useMemo(
    () =>
      Object.keys(pglTokenAddresses).reduce<[Token, Token][]>((memo, lpAddress) => {
        if (allTokensAddress.includes(pglTokenAddresses[lpAddress] ?? '')) {
          memo.push(pairTokens[lpAddress]);
        }
        return memo;
      }, []),
    [pglTokenAddresses, allTokensAddress, pairTokens],
  );

  const allPairs = usePairs(filterPairTokens);

  const checkedAllPairs = useMemo(
    () => allPairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair)),
    [allPairs],
  );

  // check pair balance greater than 0
  const allV2PairsWithLiquidity = useMemo(
    () =>
      checkedAllPairs.filter((pair) => {
        const lpAddress = pair?.liquidityToken?.address;

        const pglTokenAddress = pglTokenAddresses[lpAddress];

        const pairBalance = pglTokenAddress ? tokenBalances[pglTokenAddress] : 0;

        return BigNumber.from(pairBalance).gt(0);
      }),
    [checkedAllPairs, tokenBalances, pglTokenAddresses],
  );

  const v2IsLoading = isLoading || allV2PairsWithLiquidity?.some((V2Pair) => !V2Pair);

  return useMemo(
    () => ({ v2IsLoading, allV2PairsWithLiquidity, allPairs: checkedAllPairs }),
    [v2IsLoading, allV2PairsWithLiquidity, checkedAllPairs],
  );
}

export function useHederaCreatePair() {
  const chainId = useChainId();
  const { account } = usePangolinWeb3();
  const addTransaction = useTransactionAdder();
  const hederaFn = useHederaFn();

  return async (data: CreatePoolProps) => {
    if (!chainId || !account) return;

    const { tokenA, tokenB } = data;

    if (!tokenA || !tokenB) {
      throw new Error(`Select tokens`);
    }

    const response = await hederaFn.createPair({
      account,
      chainId,
      tokenA,
      tokenB,
    });

    if (response) {
      addTransaction(response, {
        summary: `Pair created for ${tokenA.symbol} and ${tokenB.symbol}`,
      });

      return response;
    }
  };
}

export const fetchHederaPGLTokenAddress = (pairTokenAddress: string | undefined, hederaFn: Hedera) => async () => {
  try {
    if (!pairTokenAddress) {
      return undefined;
    }

    const tokenAddress = pairTokenAddress.toLowerCase();
    // get pair contract id using api call because `asAccountString` is not working for pair address
    const { contractId } = await hederaFn.getContractData(tokenAddress);
    // get pair tokenId from pair contract id
    const tokenId = hederaFn.contractToTokenId(contractId?.toString());
    // convert token id to evm address
    const newTokenAddress = hederaFn.idToAddress(tokenId);

    return newTokenAddress;
  } catch {
    return undefined;
  }
};

export const fetchHederaPGLToken = (pairToken: Token | undefined, chainId: ChainId, hederaFn: Hedera) => async () => {
  try {
    if (!pairToken) {
      return undefined;
    }

    const tokenAddress = pairToken ? pairToken?.address : '';
    // get pair contract id using api call because `asAccountString` is not working for pair address
    const { contractId } = await hederaFn.getContractData(tokenAddress);
    // get pair tokenId from pair contract id
    const tokenId = hederaFn.contractToTokenId(contractId?.toString());
    // convert token id to evm address
    const newTokenAddress = hederaFn.idToAddress(tokenId);
    const token = new Token(chainId, newTokenAddress, pairToken?.decimals, pairToken?.symbol, pairToken?.name);
    return token;
  } catch {
    return undefined;
  }
};

export function fetchHederaTokenMetaData(tokenAddress: string | undefined, hederaFn: Hedera) {
  async function fetch() {
    try {
      if (!tokenAddress) {
        return undefined;
      }

      const result = await hederaFn.getMetadata(tokenAddress.toLowerCase());

      return result;
    } catch {
      return undefined;
    }
  }
  return fetch;
}

/**
 * This hook get all hedera token metadata from rest api
 * @param addresses address array of tokens to be queried
 * @returns object with key is the address and the value is the metadata
 */
export function useHederaTokensMetaData(addresses: (string | undefined)[]) {
  const hederaFn = useHederaFn();

  const queries = useMemo(() => {
    return addresses.map((address) => ({
      queryKey: ['get-hedera-token-metadata', address],
      queryFn: fetchHederaTokenMetaData(address, hederaFn),
    }));
  }, [addresses]);

  const results = useQueries(queries);

  return useMemo(() => {
    const result: { [x: string]: HederaTokenMetadata | undefined } = {};
    addresses.forEach((address, index) => {
      if (address) {
        result[address] = results[index].data;
      }
    });
    return result;
  }, [results]);
}

/**
 * This hook used to get pgl token specifically for given Hedera pair
 * Takes currencies as a input and return hedera pair token & token with pair contract address
 * @param currencyA
 * @param currencyB
 * @returns [pglToken, pairToken]
 */
export const useHederaPGLToken = (
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
): [Token | undefined, Token | undefined] => {
  const chainId = useChainId();
  const hederaFn = useHederaFn();

  const [pglToken, setPglToken] = useState<Token | undefined>(undefined);
  const [, pair] = usePair(currencyA, currencyB);

  const pairToken = pair?.liquidityToken;

  const { isLoading, data } = useQuery(
    ['get-pgl-token', pairToken?.address],
    fetchHederaPGLToken(pairToken, chainId, hederaFn),
  );

  useEffect(() => {
    if (!isLoading && !!data) {
      setPglToken(data);
    }
  }, [isLoading, data]);

  // here pglToken is the token where we can call methods like totalSupply, allowance etc
  // pair?.liquidityToken is the token with pair contract address where we can call methods like getReserves etc
  return [pglToken, pair?.liquidityToken];
};

export const useHederaPGLTokens = (pairs?: (Pair | undefined)[]): [Token | undefined, Token | undefined][] => {
  const chainId = useChainId();
  const hederaFn = useHederaFn();

  const queryParameter = useMemo(() => {
    return (
      pairs?.map((pair) => {
        const pairToken = pair?.liquidityToken;
        return {
          queryKey: ['get-pgl-token', pairToken?.address],
          queryFn: fetchHederaPGLToken(pairToken, chainId, hederaFn),
        };
      }) ?? []
    );
  }, [pairs]);

  const results = useQueries(queryParameter);

  return useMemo(() => {
    if (!pairs || pairs?.length === 0) return [];
    if (!chainId) return [];

    return results.reduce<[Token | undefined, Token | undefined][]>((acc, result, i) => {
      const pglToken = result?.data;
      const pair = pairs?.[i];

      if (pglToken && result?.isLoading === false) {
        acc.push([pglToken, pair?.liquidityToken]);
      }

      return acc;
    }, []);
  }, [results, pairs]);
};

/**
 * This hook used to get pgl Token(Fungible Token address) based on liquidityTokenAddress
 * Takes liquidityAddresses as a input and return liquidityTokenAddress wise pgltokenaddress
 * @param liquidityAddresses
 * @returns {[tokenAddress: string]: pgl token address;}
 */

export const useHederaPGLTokenAddresses = (
  liquidityAddresses?: (string | undefined)[],
): { [liquidityAddress: string]: string | undefined } => {
  const chainId = useChainId();
  const hederaFn = useHederaFn();

  const queryParameter = useMemo(() => {
    return (
      liquidityAddresses?.map((address) => {
        return {
          queryKey: ['get-pgl-token-address', address],
          queryFn: fetchHederaPGLTokenAddress(address, hederaFn),
        };
      }) ?? []
    );
  }, [liquidityAddresses]);

  const results = useQueries(queryParameter);

  return useMemo(() => {
    if (!liquidityAddresses || liquidityAddresses?.length === 0) return {};
    if (!chainId) return {};

    return results.reduce<{ [liquidityAddress: string]: string }>((acc, result, i) => {
      const pglAddress = result?.data;

      const lpAddress = liquidityAddresses?.[i];

      if (pglAddress && lpAddress && result?.isLoading === false) {
        acc[lpAddress] = pglAddress;
      }

      return acc;
    }, {});
  }, [results, liquidityAddresses]);
};

export function useHederaPGLAssociated(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
): ReturnType<typeof useHederaTokenAssociated> {
  // here we need to use fungible token so get pgltoken based currency
  const [pglToken] = useHederaPGLToken(currencyA, currencyB);
  return useHederaTokenAssociated(pglToken?.address, pglToken?.symbol);
}

/**
 * This hook used to get pair contract address for given lpTokenAddress ( Fungible token address )
 * Takes lpTokenAddress as a input and return pair contract address
 * @param lpTokenAddress string[]
 * @returns [pair contract address]
 */

export const useHederaPairContractEVMAddresses = (lpTokenAddress?: string[]): string[] => {
  const chainId = useChainId();
  const hederaFn = useHederaFn();

  const lpTokenContracts = useMemo(() => {
    return (lpTokenAddress || []).map((lpAddress) => {
      const tokenId = hederaFn.hederaId(lpAddress);
      return hederaFn.tokenToContractId(tokenId);
    });
  }, [lpTokenAddress]);

  const queryParameter = useMemo(() => {
    return (
      lpTokenContracts?.map((address) => {
        return {
          queryKey: ['get-pgl-token-evm-address', address],
          queryFn: () => hederaFn.getContractData(address),
        };
      }) ?? []
    );
  }, [lpTokenContracts]);

  const results = useQueries(queryParameter);

  return useMemo(() => {
    if (!chainId) return [];

    return results.reduce<string[]>((acc, result) => {
      const evmAddress = result?.data?.evmAddress;

      if (evmAddress && result?.isLoading === false) {
        acc.push(evmAddress);
      }

      return acc;
    }, []);
  }, [results]);
};
/* eslint-enable max-lines */
