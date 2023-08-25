/* eslint-disable max-lines */
import { TransactionResponse } from '@ethersproject/providers';
import { CAVAX, Pair, TokenAmount } from '@pangolindex/sdk';
import {
  ROUTER_ADDRESS,
  calculateGasMargin,
  calculateSlippageAmount,
  getRouterContract,
  unwrappedToken,
  useChainId,
  useLibrary,
  usePairContract,
  usePangolinWeb3,
  useTranslation,
  waitForTransaction,
  wrappedCurrency,
} from '@pangolindex/shared';
import {
  ApprovalState,
  toV2LiquidityToken,
  usePairsContract,
  useTokenBalances,
  useTransactionAdder,
} from '@pangolindex/state-hooks';
import { BigNumber } from 'ethers';
import { useMemo, useState } from 'react';
import { Field } from '../../state/burn/atom';
import { Field as AddField } from '../../state/mint/atom';
import { AddLiquidityProps, AttemptToApproveProps, RemoveLiquidityProps } from '../types';
import { useGetTransactionSignature, useRefetchMinichefSubgraph, useTrackedTokenPairs } from '../utils';

/**
 * this hook is used to fetch pair balance of given EVM pair
 * @param pair pair object
 * @returns pair balance in form of TokenAmount or undefined
 */
export function useEVMPairBalance(account?: string, pair?: Pair): TokenAmount | undefined {
  const token = pair?.liquidityToken;

  const [tokenBalances] = useTokenBalances(account, [token]);
  if (!token) return undefined;
  return tokenBalances[token.address];
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
          'Added ' +
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

  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalances(account ?? undefined, liquidityTokens);

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

  const v2Pairs = usePairsContract(lpTokensWithBalances);

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

  const v2AllPairs = usePairsContract(pairWithLpTokens);

  const allV2AllPairsWithLiquidity = useMemo(
    () => v2AllPairs.map(([, pair]) => pair).filter((_v2AllPairs): _v2AllPairs is Pair => Boolean(_v2AllPairs)),
    [v2AllPairs],
  );

  return useMemo(
    () => ({ v2IsLoading, allV2PairsWithLiquidity, allPairs: allV2AllPairsWithLiquidity }),
    [v2IsLoading, allV2PairsWithLiquidity, allV2AllPairsWithLiquidity],
  );
}

/* eslint-enable max-lines */
