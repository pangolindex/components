import { MaxUint256 } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { useGelatoLimitOrdersLib } from '@gelatonetwork/limit-orders-react';
import { CAVAX, ChainId, CurrencyAmount, TokenAmount, Trade } from '@pangolindex/sdk';
import { useCallback, useMemo } from 'react';
import { ZERO_ADDRESS } from 'src/constants';
import { ROUTER_ADDRESS, ROUTER_DAAS_ADDRESS } from 'src/constants/address';
import { useTokenAllowance } from 'src/data/Allowances';
import { Field } from 'src/state/pswap/actions';
import { useHasPendingApproval, useTransactionAdder } from 'src/state/ptransactions/hooks';
import { useIsApprovingInfinite } from 'src/state/puser/hooks';
import { calculateGasMargin, waitForTransaction } from 'src/utils';
import { computeSlippageAdjustedAmounts } from 'src/utils/prices';
import { useChainId, usePangolinWeb3 } from '../index';
import { useTokenContract } from '../useContract';
import { ApprovalState } from './constant';

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
        summary: 'Approved ' + amountToApprove.currency.symbol,
        approval: { tokenAddress: token.address, spender: spender },
      });
    } catch (error) {
      console.debug('Failed to approve token', error);
      throw error;
    }
  }, [approvalState, token, tokenContract, amountToApprove, spender, addTransaction, approvingInfinite]);

  return [approvalState, approve];
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

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromInputCurrencyAmount(currencyAmountIn: any | undefined) {
  const chainId = useChainId();
  const gelatoLibrary = useGelatoLimitOrdersLib();

  const newCurrencyAmountIn = currencyAmountIn
    ? new TokenAmount(currencyAmountIn?.currency, currencyAmountIn?.numerator)
    : undefined;

  return useApproveCallback(chainId, newCurrencyAmountIn, gelatoLibrary?.erc20OrderRouter.address ?? undefined);
}
