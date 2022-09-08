/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import {
  CAVAX,
  ChainId,
  Currency,
  CurrencyAmount,
  JSBI,
  Pair,
  Percent,
  Token,
  TokenAmount,
  WAVAX,
} from '@pangolindex/sdk';
import { parseUnits } from 'ethers/lib/utils';
import qs from 'qs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries } from 'react-query';
import { NEAR_EXCHANGE_CONTRACT_ADDRESS, near } from 'src/connectors';
import {
  NEAR_LP_STORAGE_AMOUNT,
  NEAR_STORAGE_TO_REGISTER_WITH_FT,
  ONE_YOCTO_NEAR,
  ONLY_ZEROS,
  ROUTER_ADDRESS,
} from 'src/constants';
import ERC20_INTERFACE from 'src/constants/abis/erc20';
import { useGetNearAllPool, useNearPairs, usePairs } from 'src/data/Reserves';
import { useChainId, useLibrary, usePangolinWeb3, useRefetchMinichefSubgraph } from 'src/hooks';
import { useAllTokens, useNearTokens } from 'src/hooks/Tokens';
import { ApprovalState } from 'src/hooks/useApproveCallback';
import { useMulticallContract, usePairContract } from 'src/hooks/useContract';
import { useGetTransactionSignature } from 'src/hooks/useGetTransactionSignature';
import { Field } from 'src/state/pburn/actions';
import { Field as AddField } from 'src/state/pmint/actions';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import {
  calculateGasMargin,
  calculateSlippageAmount,
  getRouterContract,
  isAddress,
  waitForTransaction,
} from 'src/utils';
import { FunctionCallOptions, Transaction, nearFn } from 'src/utils/near';
import { unwrappedToken, wrappedCurrency } from 'src/utils/wrappedCurrency';
import { useMultipleContractSingleData, useSingleContractMultipleData } from '../pmulticall/hooks';
import { toV2LiquidityToken, useTrackedTokenPairs } from '../puser/hooks';
import { useAccountBalanceHook, useTokenBalancesHook } from './multiChainsHooks';

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useETHBalances(
  chainId: ChainId,
  uncheckedAddresses?: (string | undefined)[],
): { [address: string]: CurrencyAmount | undefined } {
  const multicallContract = useMulticallContract();

  const addresses: string[] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .map(isAddress)
            .filter((a): a is string => a !== false)
            .sort()
        : [],
    [uncheckedAddresses],
  );

  const results = useSingleContractMultipleData(
    multicallContract,
    'getEthBalance',
    addresses.map((address) => [address]),
  );

  return useMemo(
    () =>
      addresses.reduce<{ [address: string]: CurrencyAmount }>((memo, address, i) => {
        const value = results?.[i]?.result?.[0];
        if (value) memo[address] = CurrencyAmount.ether(JSBI.BigInt(value.toString()), chainId);
        return memo;
      }, {}),
    [chainId, addresses, results],
  );
}

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

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[],
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens],
  );

  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens]);

  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', [address]);

  const anyLoading: boolean = useMemo(() => balances.some((callState) => callState.loading), [balances]);

  return [
    useMemo(
      () =>
        address && validatedTokens.length > 0
          ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
              const value = balances?.[i]?.result?.[0];
              const amount = value ? JSBI.BigInt(value.toString()) : undefined;
              if (amount) {
                memo[token.address] = new TokenAmount(token, amount);
              }
              return memo;
            }, {})
          : {},
      [address, validatedTokens, balances],
    ),
    anyLoading,
  ];
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[],
): { [tokenAddress: string]: TokenAmount | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0];
}

export function useNearTokenBalances(
  address?: string,
  tokensOrPairs?: (Token | Pair | undefined)[],
): { [tokenAddress: string]: TokenAmount | undefined } {
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

  return useMemo(
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
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(account, [token]);
  if (!token) return undefined;
  return tokenBalances[token.address];
}

// get the balance for a single token/account combo
export function useNearTokenBalance(account?: string, tokenOrPair?: Token | Pair): TokenAmount | undefined {
  const tokensOrPairs = useMemo(() => [tokenOrPair], [tokenOrPair]);
  const tokenBalances = useNearTokenBalances(account, tokensOrPairs);
  if (!tokenOrPair) return undefined;

  if (tokenOrPair && tokenOrPair instanceof Token) {
    return tokenBalances[tokenOrPair?.address];
  } else if (tokenOrPair && tokenOrPair instanceof Pair) {
    return tokenBalances[tokenOrPair?.liquidityToken?.address];
  }
}

export function useCurrencyBalances(
  chainId: ChainId,
  account?: string,
  currencies?: (Currency | undefined)[],
): (CurrencyAmount | undefined)[] {
  const tokens = useMemo(
    () => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [],
    [currencies],
  );

  const useTokenBalances_ = useTokenBalancesHook[chainId];
  const useETHBalances_ = useAccountBalanceHook[chainId];

  const tokenBalances = useTokenBalances_(account, tokens);
  const containsETH: boolean = useMemo(
    () => currencies?.some((currency) => chainId && currency === CAVAX[chainId]) ?? false,
    [chainId, currencies],
  );

  const accountArr = useMemo(() => [account], [account]);
  const memoArr = useMemo(() => [], []);
  const ethBalance = useETHBalances_(chainId, containsETH ? accountArr : memoArr);

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!account || !currency) return undefined;
        if (currency instanceof Token) return tokenBalances[currency.address];
        if (currency === CAVAX[chainId]) return ethBalance?.[account];
        return undefined;
      }) ?? [],
    [chainId, account, currencies, ethBalance, tokenBalances],
  );
}

export function useCurrencyBalance(
  chainId: ChainId,
  account?: string,
  currency?: Currency,
): CurrencyAmount | undefined {
  const currencyArr = useMemo(() => [currency], [currency]);
  return useCurrencyBalances(chainId, account, currencyArr)[0];
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: TokenAmount | undefined } {
  const { account } = usePangolinWeb3();

  const chainId = useChainId();

  const useTokenBalances_ = useTokenBalancesHook[chainId];

  const allTokens = useAllTokens();

  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens]);
  const balances = useTokenBalances_(account ?? undefined, allTokensArray);
  return balances ?? {};
}

export interface AddLiquidityProps {
  parsedAmounts: {
    CURRENCY_A?: CurrencyAmount;
    CURRENCY_B?: CurrencyAmount;
  };
  deadline: BigNumber | undefined;
  noLiquidity: boolean | undefined;
  allowedSlippage: number;
  currencies: {
    CURRENCY_A?: Currency;
    CURRENCY_B?: Currency;
  };
}

export function useAddLiquidity() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const addTransaction = useTransactionAdder();
  const refetchMinichefSubgraph = useRefetchMinichefSubgraph();

  return async (data: AddLiquidityProps) => {
    if (!chainId || !library || !account) return;

    const { parsedAmounts, deadline, noLiquidity, allowedSlippage, currencies } = data;

    const { CURRENCY_A: currencyA, CURRENCY_B: currencyB } = currencies;
    const router = getRouterContract(chainId, library, account);

    const { [AddField.CURRENCY_A]: parsedAmountA, [AddField.CURRENCY_B]: parsedAmountB } = parsedAmounts;
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline || !router) {
      return;
    }

    const amountsMin = {
      [AddField.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [AddField.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0],
    };

    let estimate,
      method: (...xyz: any) => Promise<TransactionResponse>,
      args: Array<string | string[] | number>,
      value: BigNumber | null;
    if (currencyA === CAVAX[chainId] || currencyB === CAVAX[chainId]) {
      const tokenBIsETH = currencyB === CAVAX[chainId];
      estimate = router.estimateGas.addLiquidityAVAX;
      method = router.addLiquidityAVAX;
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountsMin[tokenBIsETH ? AddField.CURRENCY_A : AddField.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? AddField.CURRENCY_B : AddField.CURRENCY_A].toString(), // eth min
        account,
        deadline.toHexString(),
      ];
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString());
    } else {
      estimate = router.estimateGas.addLiquidity;
      method = router.addLiquidity;
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? '',
        wrappedCurrency(currencyB, chainId)?.address ?? '',
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        amountsMin[AddField.CURRENCY_A].toString(),
        amountsMin[AddField.CURRENCY_B].toString(),
        account,
        deadline.toHexString(),
      ];
      value = null;
    }

    try {
      const estimatedGasLimit = await estimate(...args, value ? { value } : {});
      const response = await method(...args, {
        ...(value ? { value } : {}),
        gasLimit: calculateGasMargin(estimatedGasLimit),
      });
      await waitForTransaction(response, 5);

      addTransaction(response, {
        summary:
          'Add ' +
          parsedAmounts[AddField.CURRENCY_A]?.toSignificant(3) +
          ' ' +
          currencies[AddField.CURRENCY_A]?.symbol +
          ' and ' +
          parsedAmounts[AddField.CURRENCY_B]?.toSignificant(3) +
          ' ' +
          currencies[AddField.CURRENCY_B]?.symbol,
      });
      await refetchMinichefSubgraph();
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

export function useNearAddLiquidity() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();

  return async (data: AddLiquidityProps) => {
    if (!chainId || !library || !account) return;

    const depositTransactions: Transaction[] = [];
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

    const transactions: Transaction[] = [
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

export interface RemoveLiquidityProps {
  parsedAmounts: {
    LIQUIDITY_PERCENT: Percent;
    LIQUIDITY?: TokenAmount;
    CURRENCY_A?: CurrencyAmount;
    CURRENCY_B?: CurrencyAmount;
  };
  deadline: BigNumber | undefined;
  allowedSlippage: number;
  approval: ApprovalState;
}

interface AttemptToApproveProps {
  parsedAmounts: {
    LIQUIDITY_PERCENT: Percent;
    LIQUIDITY?: TokenAmount;
    CURRENCY_A?: CurrencyAmount;
    CURRENCY_B?: CurrencyAmount;
  };
  deadline: BigNumber | undefined;
  approveCallback: () => void;
}

export function useRemoveLiquidity(pair?: Pair | null | undefined) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const addTransaction = useTransactionAdder();
  const { t } = useTranslation();
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(
    null,
  );
  const getSignature = useGetTransactionSignature();
  const pairContract = usePairContract(pair?.liquidityToken?.address);
  const refetchMinichefSubgraph = useRefetchMinichefSubgraph();

  const removeLiquidity = async (data: RemoveLiquidityProps) => {
    if (!chainId || !library || !account || !pair) return;

    const { parsedAmounts, deadline, allowedSlippage, approval } = data;

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

    const currencyBIsAVAX = currencyB === CAVAX[chainId];
    const oneCurrencyIsAVAX = currencyA === CAVAX[chainId] || currencyBIsAVAX;

    if (!tokenA || !tokenB) throw new Error(t('error.couldNotWrap'));

    let methodNames: string[], args: Array<string | string[] | number | boolean>;
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityAVAX
      if (oneCurrencyIsAVAX) {
        methodNames = ['removeLiquidityAVAX', 'removeLiquidityAVAXSupportingFeeOnTransferTokens'];
        args = [
          currencyBIsAVAX ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsAVAX ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsAVAX ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadline.toHexString(),
        ];
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity'];
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadline.toHexString(),
        ];
      }
    }
    // we have a signature, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityAVAXWithPermit
      if (oneCurrencyIsAVAX) {
        methodNames = ['removeLiquidityAVAXWithPermit', 'removeLiquidityAVAXWithPermitSupportingFeeOnTransferTokens'];
        args = [
          currencyBIsAVAX ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsAVAX ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsAVAX ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ];
      }
      // removeLiquidityAVAXWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit'];
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ];
      }
    } else {
      throw new Error(t('error.attemptingToConfirmApproval'));
    }

    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map((methodName) =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch((err) => {
            console.error(`estimateGas failed`, methodName, args, err);
            return undefined;
          }),
      ),
    );

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex((safeGasEstimate) =>
      BigNumber.isBigNumber(safeGasEstimate),
    );

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.');
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation];
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation];

      try {
        const response: TransactionResponse = await router[methodName](...args, {
          gasLimit: safeGasEstimate,
        });
        await waitForTransaction(response, 5);
        addTransaction(response, {
          summary:
            t('removeLiquidity.remove') +
            ' ' +
            parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
            ' ' +
            currencyA?.symbol +
            ' and ' +
            parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
            ' ' +
            currencyB?.symbol,
        });
        await refetchMinichefSubgraph();
        return response;
      } catch (err) {
        const _err = err as any;
        // we only care if the error is something _other_ than the user rejected the tx
        if (_err?.code !== 4001) {
          console.error(_err);
        }
      }
    }
  };

  const onAttemptToApprove = async (data1: AttemptToApproveProps) => {
    const { parsedAmounts, deadline, approveCallback } = data1;

    if (!pairContract || !pair || !library || !deadline || !chainId || !account)
      throw new Error(t('earn.missingDependencies'));
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    if (!liquidityAmount) throw new Error(t('earn.missingLiquidityAmount'));

    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account);

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ];
    const domain = {
      name: 'Pangolin Liquidity',
      version: '1',
      chainId: chainId,
      verifyingContract: pair.liquidityToken.address,
    };
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];
    const message = {
      owner: account,
      spender: ROUTER_ADDRESS[chainId],
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadline.toNumber(),
    };
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    });

    try {
      const signature: any = await getSignature(data);

      setSignatureData({
        v: signature.v,
        r: signature.r,
        s: signature.s,
        deadline: deadline.toNumber(),
      });
    } catch (err: any) {
      approveCallback();
    }
  };
  return { removeLiquidity, onAttemptToApprove, signatureData, setSignatureData };
}

export function useNearRemoveLiquidity(pair: Pair) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const { t } = useTranslation();

  const removeLiquidity = async (data: RemoveLiquidityProps) => {
    if (!chainId || !library || !account) return;

    let transactions: Transaction[] = [];

    const withDrawTransactions: Transaction[] = [];

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

export function useGetUserLP() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs();

  const tokenPairsWithLiquidityTokens = useMemo(
    () =>
      trackedTokenPairs.map((tokens) => ({
        liquidityToken: toV2LiquidityToken(tokens, chainId),
        tokens,
      })),
    [trackedTokenPairs, chainId],
  );

  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  );

  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens,
  );

  //fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances],
  );

  const lpTokensWithBalances = useMemo(
    () => liquidityTokensWithBalances.map(({ tokens }) => tokens),
    [liquidityTokensWithBalances],
  );
  const v2Pairs = usePairs(lpTokensWithBalances);

  const v2IsLoading =
    fetchingV2PairBalances ||
    v2Pairs?.length < liquidityTokensWithBalances.length ||
    v2Pairs?.some((V2Pair) => !V2Pair);

  const allV2PairsWithLiquidity = useMemo(
    () => v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair)),
    [v2Pairs],
  );

  const pairWithLpTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map(({ tokens }) => tokens),
    [tokenPairsWithLiquidityTokens],
  );
  const v2AllPairs = usePairs(pairWithLpTokens);

  const allV2AllPairsWithLiquidity = useMemo(
    () => v2AllPairs.map(([, pair]) => pair).filter((_v2AllPairs): _v2AllPairs is Pair => Boolean(_v2AllPairs)),
    [v2AllPairs],
  );

  return useMemo(
    () => ({ v2IsLoading, allV2PairsWithLiquidity, allPairs: allV2AllPairsWithLiquidity }),
    [v2IsLoading, allV2PairsWithLiquidity, allV2AllPairsWithLiquidity],
  );
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

  const v2PairsBalances = useNearTokenBalances(account ?? undefined, allV2Pairs);

  //fetch the reserves for all V2 pools in which the user has a balance
  const allV2PairsWithLiquidity = useMemo(
    () => allV2Pairs.filter(({ liquidityToken }) => v2PairsBalances[liquidityToken.address]?.greaterThan('0')),
    [allV2Pairs, v2PairsBalances],
  );

  const pairs = (liquidityTokens || memoArray).length > 0 ? allV2PairsWithLiquidity : [];

  return useMemo(() => ({ v2IsLoading, allV2PairsWithLiquidity: pairs }), [v2IsLoading, pairs]);
}

export interface CreatePoolProps {
  tokenA?: Token;
  tokenB?: Token;
}

export function useNearCreatePool() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();

  return async (data: CreatePoolProps) => {
    if (!chainId || !library || !account) return;

    let transactions: Transaction[] = [];

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
