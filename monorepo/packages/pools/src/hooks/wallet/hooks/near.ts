/* eslint-disable max-lines */

import { ChainId, Pair, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import {
  NEAR_LP_STORAGE_AMOUNT,
  NEAR_STORAGE_TO_REGISTER_WITH_FT,
  ONE_YOCTO_NEAR,
  ONLY_ZEROS,
  calculateSlippageAmount,
  useChainId,
  useLibrary,
  usePangolinWeb3,
  useTranslation,
  wrappedCurrency,
} from '@pangolindex/shared';
import { useGetNearAllPool, useNearPairs, useNearTokens } from '@pangolindex/state-hooks';
import {
  FunctionCallOptions,
  NEAR_EXCHANGE_CONTRACT_ADDRESS,
  NearTransaction,
  near,
  nearFn,
} from '@pangolindex/wallet-connectors';
import { parseUnits } from 'ethers/lib/utils';
import qs from 'qs';
import { useEffect, useMemo, useState } from 'react';
import { useQueries } from 'react-query';
import { Field } from '../../burn/atom';
import { Field as AddField } from '../../mint/atom';
import { AddLiquidityProps, CreatePoolProps, RemoveLiquidityProps } from '../types';

/**
 * Returns a Near Wallet balance.
 */
export function useNearBalance(
  chainId: ChainId,
  accounts?: (string | undefined)[],
): { [address: string]: any } | undefined {
  const [nearBalance, setNearBalance] = useState<{ [address: string]: any }>();

  const nearToken = WAVAX[chainId];

  useEffect(() => {
    async function checkNearBalance() {
      const balance = await near.getAccountBalance();
      if (balance && accounts?.[0]) {
        const nearTokenBalance = new TokenAmount(nearToken, balance.available);

        const container = {} as { [address: string]: any | undefined };
        container[accounts?.[0]] = nearTokenBalance;

        setNearBalance(container);
      }
    }

    checkNearBalance();
  }, [accounts, chainId]);

  return useMemo(() => nearBalance, [nearBalance]);
}

const fetchNearTokenBalance = (token?: Token, account?: string) => async () => {
  if (token) {
    const balance = await nearFn.getTokenBalance(token?.address, account);

    return new TokenAmount(token, balance);
  }
  return undefined;
};

const fetchNearPoolShare = (chainId: number, pair: Pair) => async () => {
  if (pair) {
    const share = await nearFn.getSharesInPool(chainId, pair?.token0, pair?.token1);

    return new TokenAmount(pair?.liquidityToken, share);
  }
  return undefined;
};

export function useNearTokenBalances(
  address?: string,
  tokensOrPairs?: (Token | Pair | undefined)[],
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const chainId = useChainId();

  const queryParameter = useMemo(() => {
    return (
      tokensOrPairs?.map((item) => {
        if (item instanceof Pair) {
          return {
            queryKey: ['pair-balance', item?.liquidityToken?.address, address],
            queryFn: fetchNearPoolShare(chainId, item),
          };
        }
        return {
          queryKey: ['token-balance', item?.address, address],
          queryFn: fetchNearTokenBalance(item, address),
        };
      }) ?? []
    );
  }, [tokensOrPairs]);

  const results = useQueries(queryParameter);

  const anyLoading = useMemo(() => results?.some((t) => t?.isLoading), [results]);
  const tokenBalances = useMemo(
    () =>
      results.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, result, i) => {
        const value = result?.data;
        const token = tokensOrPairs?.[i];

        if (token && token instanceof Token) {
          memo[token?.address] = value;
        } else if (token && token instanceof Pair) {
          memo[token?.liquidityToken?.address] = value;
        }
        return memo;
      }, {}),
    [tokensOrPairs, address, results],
  );

  return [tokenBalances, anyLoading];
}

// get the balance for a single token/account combo
export function useNearTokenBalance(account?: string, tokenOrPair?: Token | Pair): TokenAmount | undefined {
  const tokensOrPairs = useMemo(() => [tokenOrPair], [tokenOrPair]);
  const [tokenBalances] = useNearTokenBalances(account, tokensOrPairs);
  if (!tokenOrPair) return undefined;

  if (tokenOrPair && tokenOrPair instanceof Token) {
    return tokenBalances[tokenOrPair?.address];
  } else if (tokenOrPair && tokenOrPair instanceof Pair) {
    return tokenBalances[tokenOrPair?.liquidityToken?.address];
  }
}

// get the balance for a single token/account combo
export function useNearPairBalance(account?: string, pair?: Pair): TokenAmount | undefined {
  const tokensOrPairs = useMemo(() => [pair], [pair]);
  const [tokenBalances] = useNearTokenBalances(account, tokensOrPairs);
  if (!pair) return undefined;

  if (pair && pair instanceof Pair) {
    return tokenBalances[pair?.liquidityToken?.address];
  }
}

export function useNearAddLiquidity() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();

  return async (data: AddLiquidityProps) => {
    if (!chainId || !library || !account) return;

    const depositTransactions: NearTransaction[] = [];
    const { parsedAmounts, deadline, currencies } = data;
    const { CURRENCY_A: currencyA, CURRENCY_B: currencyB } = currencies;

    const { [AddField.CURRENCY_A]: parsedAmountA, [AddField.CURRENCY_B]: parsedAmountB } = parsedAmounts;

    const tokenA = currencyA ? wrappedCurrency(currencyA, chainId) : undefined;
    const tokenB = currencyB ? wrappedCurrency(currencyB, chainId) : undefined;

    if (!parsedAmountA || !parsedAmountB || !deadline || !tokenA || !tokenB) {
      throw new Error(`Missing dependency`);
    }

    const poolId = await nearFn.getPoolId(chainId, tokenA, tokenB);

    const tokens = [tokenA, tokenB];

    const mainAmounts = [parsedAmountA.toFixed(), parsedAmountB.toFixed()];

    const amounts = [
      parseUnits(parsedAmountA.toFixed(), tokenA?.decimals).toString(),
      parseUnits(parsedAmountB.toFixed(), tokenB?.decimals).toString(),
    ];
    const exchangeContractId = NEAR_EXCHANGE_CONTRACT_ADDRESS[chainId];
    const wNearContractId = WAVAX[chainId].address;
    const whitelist = await nearFn.getWhitelistedTokens(chainId);

    for (let i = 0; i < tokens.length; i++) {
      const currencyId = tokens[i].address;

      depositTransactions.unshift({
        receiverId: currencyId,
        functionCalls: [
          {
            methodName: 'ft_transfer_call',
            args: {
              receiver_id: exchangeContractId,
              amount: amounts[i],
              msg: '',
            },
            amount: ONE_YOCTO_NEAR,
          },
        ],
      });

      const tokenRegistered = await nearFn.getStorageBalance(currencyId, exchangeContractId);

      if (tokenRegistered === null) {
        depositTransactions.unshift({
          receiverId: currencyId,
          functionCalls: [
            nearFn.storageDepositAction({
              accountId: exchangeContractId,
              registrationOnly: true,
              amount: NEAR_STORAGE_TO_REGISTER_WITH_FT,
            }),
          ],
        });
      }

      if (!whitelist.includes(currencyId)) {
        depositTransactions.unshift({
          receiverId: exchangeContractId,
          functionCalls: [nearFn.registerTokenAction(currencyId)],
        });
      }
    }

    const neededStorage = await nearFn.checkUserNeedsStorageDeposit(chainId);

    if (neededStorage) {
      depositTransactions.unshift({
        receiverId: exchangeContractId,
        functionCalls: [nearFn.storageDepositAction({ amount: neededStorage })],
      });
    }

    const actions: FunctionCallOptions[] = [
      {
        methodName: 'add_liquidity',
        args: { pool_id: poolId, amounts },
        amount: NEAR_LP_STORAGE_AMOUNT,
      },
    ];

    const transactions: NearTransaction[] = [
      ...depositTransactions,
      {
        receiverId: exchangeContractId,
        functionCalls: [...actions],
      },
    ];

    if (transactions.length > 0) {
      const wNearTokenIndex = tokens.findIndex((token) => token?.address === wNearContractId);

      if (wNearTokenIndex > -1 && !ONLY_ZEROS.test(mainAmounts[wNearTokenIndex])) {
        transactions.unshift({
          receiverId: wNearContractId,
          functionCalls: [nearFn.nearDepositAction(mainAmounts[wNearTokenIndex])],
        });
      }

      if (wNearTokenIndex > -1) {
        const registered = await nearFn.getStorageBalance(wNearContractId);

        if (registered === null) {
          transactions.unshift({
            receiverId: wNearContractId,
            functionCalls: [
              nearFn.storageDepositAction({
                registrationOnly: true,
                amount: NEAR_STORAGE_TO_REGISTER_WITH_FT,
              }),
            ],
          });
        }
      }
    }

    return nearFn.executeMultipleTransactions(transactions);
  };
}

export function useNearRemoveLiquidity(pair: Pair) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const { t } = useTranslation();

  const removeLiquidity = async (data: RemoveLiquidityProps) => {
    if (!chainId || !library || !account) return;

    let transactions: NearTransaction[] = [];

    const withDrawTransactions: NearTransaction[] = [];

    const { parsedAmounts, deadline, allowedSlippage } = data;

    if (!chainId || !library || !account || !deadline) throw new Error(t('error.missingDependencies'));
    const { [AddField.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts;

    const tokenA = pair?.token0;
    const tokenB = pair?.token1;

    if (!currencyAmountA || !currencyAmountB) {
      throw new Error(t('error.missingCurrencyAmounts'));
    }

    const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    if (!liquidityAmount) throw new Error(t('error.missingLiquidityAmount'));

    if (!tokenA || !tokenB) throw new Error(t('error.missingTokens'));

    const poolId = await nearFn.getPoolId(chainId, tokenA, tokenB);

    const tokens = [tokenA, tokenB];

    const amountsMin = [
      calculateSlippageAmount(currencyAmountA, allowedSlippage)[0]?.toString(),
      calculateSlippageAmount(currencyAmountB, allowedSlippage)[0]?.toString(),
    ];

    const exchangeContractId = NEAR_EXCHANGE_CONTRACT_ADDRESS[chainId];

    for (const token of tokens) {
      const currencyId = token.address;

      const tokenRegistered = await nearFn.getStorageBalance(currencyId, exchangeContractId);

      if (tokenRegistered === null) {
        withDrawTransactions.unshift({
          receiverId: currencyId,
          functionCalls: [
            nearFn.storageDepositAction({
              accountId: exchangeContractId,
              registrationOnly: true,
              amount: NEAR_STORAGE_TO_REGISTER_WITH_FT,
            }),
          ],
        });
      }
    }

    const neededStorage = await nearFn.checkUserNeedsStorageDeposit(chainId);

    if (neededStorage) {
      withDrawTransactions.unshift({
        receiverId: exchangeContractId,
        functionCalls: [nearFn.storageDepositAction({ amount: neededStorage })],
      });
    }

    const withdrawActions = tokens.map((token) => nearFn.withdrawAction({ tokenId: token?.address, amount: '0' }));

    const actions: FunctionCallOptions[] = [
      {
        methodName: 'remove_liquidity',
        args: { pool_id: poolId, shares: liquidityAmount?.raw.toString(), min_amounts: amountsMin },
        amount: ONE_YOCTO_NEAR,
      },
    ];

    withdrawActions.forEach((item) => {
      actions.push(item);
    });

    transactions = [
      ...withDrawTransactions,
      {
        receiverId: exchangeContractId,
        functionCalls: [...actions],
      },
    ];

    return nearFn.executeMultipleTransactions(transactions);
  };

  const onAttemptToApprove = () => {
    // This is intentional
  };

  return { removeLiquidity, onAttemptToApprove, signatureData: undefined, setSignatureData: () => {} };
}

export function useGetNearUserLP() {
  const { account } = usePangolinWeb3();

  const { isLoading: v2IsLoading, data: pools = [] } = useGetNearAllPool();

  const allTokenAddress = useMemo(() => {
    let tokenAddresses = [] as Array<string>;

    for (let i = 0; i < pools?.length; i++) {
      tokenAddresses = [...tokenAddresses, ...pools?.[i]?.token_account_ids];
    }

    return [...new Set(tokenAddresses)];
  }, [pools]);

  const allTokens = useNearTokens(allTokenAddress);

  const tokensMapping = useMemo(() => {
    if (allTokens && allTokens.length > 0 && allTokenAddress.length === allTokens.length) {
      const tokensObj = {};

      for (let i = 0; i < allTokens?.length; i++) {
        tokensObj[allTokens?.[i]?.address as string] = allTokens[i];
      }

      return tokensObj;
    }
    return undefined;
  }, [allTokens, allTokenAddress]);

  const liquidityTokens = useMemo(() => {
    if (allTokens && allTokens.length > 0 && tokensMapping && Object.keys(tokensMapping).length === allTokens.length) {
      const allLPTokens: [Token, Token][] = (pools || []).map((pool) => {
        const tokens = pool?.token_account_ids.map((address) => {
          const token = tokensMapping[address];
          return token as Token;
        });
        return [tokens?.[0], tokens?.[1]];
      });

      return allLPTokens;
    }

    return undefined;
  }, [allTokens, pools, tokensMapping]);

  const memoArray = useMemo(() => [], []);

  const v2AllPairs = useNearPairs(liquidityTokens || memoArray);

  const allV2Pairs = useMemo(
    () => v2AllPairs.map(([, pair]) => pair).filter((_v2AllPairs): _v2AllPairs is Pair => Boolean(_v2AllPairs)),
    [v2AllPairs],
  );

  const [v2PairsBalances] = useNearTokenBalances(account ?? undefined, allV2Pairs);

  //fetch the reserves for all V2 pools in which the user has a balance
  const allV2PairsWithLiquidity = useMemo(
    () => allV2Pairs.filter(({ liquidityToken }) => v2PairsBalances[liquidityToken.address]?.greaterThan('0')),
    [allV2Pairs, v2PairsBalances],
  );

  const pairs = (liquidityTokens || memoArray).length > 0 ? allV2PairsWithLiquidity : [];

  return useMemo(() => ({ v2IsLoading, allV2PairsWithLiquidity: pairs }), [v2IsLoading, pairs]);
}

export function useNearCreatePair() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();

  return async (data: CreatePoolProps) => {
    if (!chainId || !library || !account) return;

    let transactions: NearTransaction[] = [];

    const { tokenA, tokenB } = data;

    if (!tokenA || !tokenB) {
      throw new Error(`Missing dependency`);
    }

    // const poolId = await nearFn.getPoolId(chainId, tokenA, tokenB);
    // if (poolId) {
    //   throw new Error(`Pool is already exits`);
    // }

    const tokens = [tokenA, tokenB];

    const exchangeContractId = NEAR_EXCHANGE_CONTRACT_ADDRESS[chainId];

    const tokenIds = tokens.map((token) => token?.address);

    const storageBalances = await Promise.all(tokenIds.map((id) => nearFn.getStorageBalance(id, exchangeContractId)));

    transactions = storageBalances
      .reduce((acc: string[], sb, i) => {
        if (!sb || sb.total === '0') acc.push(tokenIds[i]);
        return acc;
      }, [])
      .map((id) => ({
        receiverId: id,

        functionCalls: [
          nearFn.storageDepositAction({
            accountId: exchangeContractId,
            registrationOnly: true,
            amount: NEAR_STORAGE_TO_REGISTER_WITH_FT,
          }),
        ],
      }));

    transactions.push({
      receiverId: exchangeContractId,
      functionCalls: [
        {
          methodName: 'add_simple_pool',
          args: { tokens: tokenIds, fee: 0.5 },
          amount: '0.05',
        },
      ],
    });

    const query = qs.stringify({
      currency0: tokenA?.address,
      currency1: tokenB?.address,
    });

    return nearFn.executeMultipleTransactions(
      transactions,
      `${window.location.origin}/${window.location.hash}?${query}`,
    );
  };
}

/* eslint-enable max-lines */
