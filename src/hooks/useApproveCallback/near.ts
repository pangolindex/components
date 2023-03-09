import { ChainId, Trade } from '@pangolindex/sdk';
import { useCallback } from 'react';
import { ApprovalState } from './constant';

export function useNearApproveCallback(): [ApprovalState, () => Promise<void>] {
  const approve = useCallback(async (): Promise<void> => {
    Promise.resolve(42);
  }, []);

  return [ApprovalState.APPROVED, approve];
}

//TODO:  Near Swap Approve dummy hook
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useApproveCallbackFromNearTrade(_chainId: ChainId, _trade?: Trade, _allowedSlippage = 0) {
  const approve = () => {
    return Promise.resolve();
  };
  return [ApprovalState.APPROVED, approve] as [ApprovalState, () => Promise<void>];
}
