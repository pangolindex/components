import { BigNumber } from '@ethersproject/bignumber';
import { CAVAX, ChainId, CurrencyAmount, JSBI, TokenAmount, Trade } from '@pangolindex/sdk';
import {
  Field,
  ROUTER_ADDRESS,
  ROUTER_DAAS_ADDRESS,
  ZERO_ADDRESS,
  computeSlippageAdjustedAmounts,
  hederaFn,
  usePangolinWeb3,
  wait,
} from '@pangolindex/shared';
import { useCallback, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useHederaTokenAllowance } from 'src/hooks/useTokenAllowance/hedera';
import { useHederaTotalSupply } from 'src/hooks/useTotalSupply/hedera';
import { fetchHederaPGLToken, useHasPendingApproval, useIsApprovingInfinite, useTransactionAdder } from 'src/state';
import { ApprovalState } from './constant';

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useHederaApproveCallback(
  chainId: ChainId,
  amountToApprove?: CurrencyAmount,
  spender?: string,
): [ApprovalState, () => Promise<void>] {
  const { account } = usePangolinWeb3();
  const [isPendingApprove, setIsPendingApprove] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

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

  const currentAllowance = useHederaTokenAllowance(token, account ?? undefined, spender);
  const pendingApproval = useHasPendingApproval(token?.address, spender);

  const tokenSupply = useHederaTotalSupply(token);

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;
    if (amountToApprove.currency === CAVAX[chainId]) return ApprovalState.APPROVED;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance || !tokenSupply) return ApprovalState.UNKNOWN;

    // if the current allowance is greather than total supply we need to re-approve
    if (tokenSupply.lessThan(currentAllowance)) {
      return ApprovalState.NOT_APPROVED;
    }

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
  }, [amountToApprove, currentAllowance, pendingApproval, isPendingApprove, isApproved, spender, tokenSupply]);

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
      setIsPendingApprove(true);
      const response = await hederaFn.spendingApproval({
        tokenAddress: token.address,
        spender: spender,
        amount: approveAmount,
        account,
      });

      if (response) {
        addTransaction(response, {
          summary: 'Approved ' + amountToApprove.currency.symbol,
          approval: { tokenAddress: token.address, spender: spender },
        });
        setIsApproved(true);
      }
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
    amountToApprove,
    spender,
    addTransaction,
    setIsPendingApprove,
    approvingInfinite,
    tokenSupply,
  ]);

  return [approvalState, approve];
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
