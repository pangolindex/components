import { MaxUint256 } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { CAVAX, CHAINS, ChainId, CurrencyAmount, ElixirTrade, TokenAmount, Trade } from '@pangolindex/sdk';
import {
  Field,
  ROUTER_ADDRESS,
  ROUTER_DAAS_ADDRESS,
  ZERO_ADDRESS,
  calculateGasMargin,
  computeSlippageAdjustedAmounts,
  usePangolinWeb3,
  useTokenContract,
  wait,
  waitForTransaction,
} from '@honeycomb/shared';
import { useCallback, useMemo, useState } from 'react';
import { useTokenAllowance } from 'src/hooks/useTokenAllowance/evm';
import { useHasPendingApproval, useIsApprovingInfinite, useTransactionAdder } from 'src/state';
import { ApprovalState } from './constant';

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  chainId: ChainId,
  amountToApprove?: CurrencyAmount,
  spender?: string,
): [ApprovalState, () => Promise<void>] {
  const { account } = usePangolinWeb3();
  const [isPendingApprove, setIsPendingApprove] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

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
    if (!currentAllowance.lessThan(amountToApprove) || isApproved) {
      return ApprovalState.APPROVED;
    } else {
      if (pendingApproval || isPendingApprove) {
        return ApprovalState.PENDING;
      } else {
        return ApprovalState.NOT_APPROVED;
      }
    }
  }, [amountToApprove, currentAllowance, pendingApproval, isPendingApprove, isApproved, spender]);

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
      setIsPendingApprove(true);
      const response: TransactionResponse = await tokenContract.approve(spender, approveAmount, {
        gasLimit: calculateGasMargin(estimatedGas),
      });
      await waitForTransaction(response, 1);
      addTransaction(response, {
        summary: 'Approved ' + amountToApprove.currency.symbol,
        approval: { tokenAddress: token.address, spender: spender },
      });
      setIsApproved(true);
    } catch (error) {
      console.debug('Failed to approve token', error);
      throw error;
    } finally {
      // we wait 1 second to be able to update the state with all the transactions,
      // because as we set isPendingApprove to false, the pendingApproval still hasn't
      // had time to be true and ends up returning ApprovalState.NOT_APPROVED
      await wait(1000);
      setIsPendingApprove(false);
    }
  }, [
    approvalState,
    token,
    tokenContract,
    amountToApprove,
    spender,
    addTransaction,
    setIsPendingApprove,
    approvingInfinite,
  ]);

  return [approvalState, approve];
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(chainId: ChainId, trade?: Trade | ElixirTrade, allowedSlippage = 0) {
  const [amountToApprove, routerAddress] = useMemo(() => {
    if (!chainId || !trade) return [undefined, undefined];
    const elixirSwapRouter = CHAINS[chainId].contracts!.elixir?.swapRouter;
    return [
      computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT],
      trade instanceof ElixirTrade
        ? elixirSwapRouter
        : trade.feeTo === ZERO_ADDRESS
        ? ROUTER_ADDRESS[chainId]
        : ROUTER_DAAS_ADDRESS[chainId],
    ];
  }, [trade, allowedSlippage]);
  return useApproveCallback(chainId, amountToApprove, routerAddress);
}
