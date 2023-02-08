import { BigNumber } from '@ethersproject/bignumber';
import { MaxUint256 } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { useGelatoLimitOrdersLib } from '@gelatonetwork/limit-orders-react';
import { CAVAX, ChainId, CurrencyAmount, JSBI, TokenAmount, Trade } from '@pangolindex/sdk';
import { useCallback, useMemo } from 'react';
import { useQuery } from 'react-query';
import { ROUTER_ADDRESS, ROUTER_DAAS_ADDRESS, ZERO_ADDRESS } from 'src/constants';
import { useTokenAllowance } from 'src/data/Allowances';
import { useTotalSupply } from 'src/data/TotalSupply';
import { Field } from 'src/state/pswap/actions';
import { useHasPendingApproval, useTransactionAdder } from 'src/state/ptransactions/hooks';
import { useIsApprovingInfinite } from 'src/state/puser/hooks';
import { fetchHederaPGLToken } from 'src/state/pwallet/hooks';
import { calculateGasMargin, waitForTransaction } from 'src/utils';
import { hederaFn } from 'src/utils/hedera';
import { computeSlippageAdjustedAmounts } from '../utils/prices';
import { useTokenContract } from './useContract';
import { useChainId, usePangolinWeb3 } from './index';

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  chainId: ChainId,
  amountToApprove?: CurrencyAmount,
  spender?: string,
): [ApprovalState, () => Promise<void>] {
  const { account } = usePangolinWeb3();

  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined;
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender);
  const pendingApproval = useHasPendingApproval(token?.address, spender);

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;
    if (amountToApprove.currency === CAVAX[chainId]) return ApprovalState.APPROVED;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [amountToApprove, currentAllowance, pendingApproval, spender]);

  const tokenContract = useTokenContract(token?.address);
  const addTransaction = useTransactionAdder();

  const approvingInfinite = useIsApprovingInfinite();

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily');
      return;
    }
    if (!token) {
      console.error('no token');
      return;
    }

    if (!tokenContract) {
      console.error('tokenContract is null');
      return;
    }

    if (!amountToApprove) {
      console.error('missing amount to approve');
      return;
    }

    if (!spender) {
      console.error('no spender');
      return;
    }

    let approveAmount = approvingInfinite ? MaxUint256.toString() : amountToApprove.raw.toString();
    const estimatedGas = await tokenContract.estimateGas.approve(spender, approveAmount).catch(() => {
      // general fallback for tokens who restrict approval amounts
      approveAmount = amountToApprove.raw.toString();
      return tokenContract.estimateGas.approve(spender, amountToApprove.raw.toString());
    });

    try {
      const response: TransactionResponse = await tokenContract.approve(spender, approveAmount, {
        gasLimit: calculateGasMargin(estimatedGas),
      });
      await waitForTransaction(response, 1);
      addTransaction(response, {
        summary: 'Approve ' + amountToApprove.currency.symbol,
        approval: { tokenAddress: token.address, spender: spender },
      });
    } catch (error) {
      console.debug('Failed to approve token', error);
      throw error;
    }
  }, [approvalState, token, tokenContract, amountToApprove, spender, addTransaction, approvingInfinite]);

  return [approvalState, approve];
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useHederaApproveCallback(
  chainId: ChainId,
  amountToApprove?: CurrencyAmount,
  spender?: string,
): [ApprovalState, () => Promise<void>] {
  const { account } = usePangolinWeb3();

  const amountToken = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined;

  //Here for Hedera chain we need to pass fungibal token for get TokenAllowance so need to convert
  const { isLoading, data } = useQuery(
    ['get-pgl-token', amountToken?.address],
    fetchHederaPGLToken(amountToken, chainId),
    {
      enabled: amountToken?.symbol === 'PGL',
    },
  );

  const token = amountToken?.symbol === 'PGL' && !isLoading && data ? data : amountToken;

  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender);
  const pendingApproval = useHasPendingApproval(token?.address, spender);

  const tokenSupply = useTotalSupply(token);

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;
    if (amountToApprove.currency === CAVAX[chainId]) return ApprovalState.APPROVED;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;

    // amountToApprove will be defined if currentAllowance is
    if (currentAllowance.lessThan(amountToApprove)) {
      if (pendingApproval) {
        return ApprovalState.PENDING;
      } else {
        return ApprovalState.NOT_APPROVED;
      }
    } else {
      return ApprovalState.APPROVED;
    }
  }, [amountToApprove, currentAllowance, pendingApproval, spender]);

  const addTransaction = useTransactionAdder();

  const approvingInfinite = useIsApprovingInfinite();

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily');
      return;
    }
    if (!token || !tokenSupply) {
      console.error('no token');
      return;
    }

    if (!amountToApprove) {
      console.error('missing amount to approve');
      return;
    }

    if (!spender) {
      console.error('no spender');
      return;
    }

    const ONE_TOKEN = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(amountToApprove?.currency?.decimals));

    // here we add ONE_TOKEN because amountToApprove constantly increasing every second
    // so by adding more amount, approved amount will be valid for transaction
    const _amount = BigNumber.from(ONE_TOKEN?.toString()).add(amountToApprove?.raw?.toString()).toString();

    const approveAmount = approvingInfinite ? tokenSupply?.raw.toString() : _amount;

    try {
      const response = await hederaFn.spendingApproval({
        tokenAddress: token.address,
        spender: spender,
        amount: approveAmount,
        account,
      });

      if (response) {
        addTransaction(response, {
          summary: 'Approve ' + amountToApprove.currency.symbol,
          approval: { tokenAddress: token.address, spender: spender },
        });
      }
    } catch (error) {
      console.debug('Failed to approve token', error);
      throw error;
    }
  }, [approvalState, token, amountToApprove, spender, addTransaction, approvingInfinite, tokenSupply]);

  return [approvalState, approve];
}

export function useNearApproveCallback(): [ApprovalState, () => Promise<void>] {
  const approve = useCallback(async (): Promise<void> => {
    Promise.resolve(42);
  }, []);

  return [ApprovalState.APPROVED, approve];
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(chainId: ChainId, trade?: Trade, allowedSlippage = 0) {
  const [amountToApprove, routerAddress] = useMemo(() => {
    if (!chainId || !trade) return [undefined, undefined];
    return [
      computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT],
      trade.feeTo === ZERO_ADDRESS ? ROUTER_ADDRESS[chainId] : ROUTER_DAAS_ADDRESS[chainId],
    ];
  }, [trade, allowedSlippage]);
  return useApproveCallback(chainId, amountToApprove, routerAddress);
}

//TODO:  Near Swap Approve dummy hook
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useApproveCallbackFromNearTrade(_chainId: ChainId, _trade?: Trade, _allowedSlippage = 0) {
  const approve = () => {
    return Promise.resolve();
  };
  return [ApprovalState.APPROVED, approve] as [ApprovalState, () => Promise<void>];
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromHederaTrade(chainId: ChainId, trade?: Trade, allowedSlippage = 0) {
  const [amountToApprove, routerAddress] = useMemo(() => {
    if (!chainId || !trade) return [undefined, undefined];
    return [
      computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT],
      trade.feeTo === ZERO_ADDRESS ? ROUTER_ADDRESS[chainId] : ROUTER_DAAS_ADDRESS[chainId],
    ];
  }, [trade, allowedSlippage]);
  return useHederaApproveCallback(chainId, amountToApprove, routerAddress);
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromInputCurrencyAmount(currencyAmountIn: any | undefined) {
  const chainId = useChainId();
  const gelatoLibrary = useGelatoLimitOrdersLib();

  const newCurrencyAmountIn = currencyAmountIn
    ? new TokenAmount(currencyAmountIn?.currency, currencyAmountIn?.numerator)
    : undefined;

  return useApproveCallback(chainId, newCurrencyAmountIn, gelatoLibrary?.erc20OrderRouter.address ?? undefined);
}
