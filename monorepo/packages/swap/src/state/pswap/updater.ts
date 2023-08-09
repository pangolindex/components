import { Contract } from '@ethersproject/contracts';
import { getRouterContractDaaS } from '@pangolindex//utils';
import { ZERO_ADDRESS } from '@pangolindex/constants';
import { useChainId, useLibrary } from '@pangolindex/hooks';
import { NEVER_RELOAD, useSingleCallResult } from '@pangolindex/state';
import { useEffect, useMemo } from 'react';
import { useSwapState } from './atom';

export default function Updater(): null {
  const chainId = useChainId();
  const { library } = useLibrary();
  const { swapState: state, updateFeeInfo } = useSwapState();
  const feeTo = state[chainId]?.feeTo;

  const router: Contract | null = useMemo(() => {
    if (!chainId || !library || !feeTo || feeTo === ZERO_ADDRESS) return null;
    return getRouterContractDaaS(chainId, library);
  }, [chainId, library, feeTo]);

  const feeInfoResponse = useSingleCallResult(router, 'getFeeInfo', [feeTo], NEVER_RELOAD).result;

  useEffect(() => {
    if (!feeInfoResponse || !updateFeeInfo || !chainId) return;
    const feeInfo = {
      feePartner: feeInfoResponse.feePartner,
      feeProtocol: feeInfoResponse.feeProtocol,
      feeTotal: feeInfoResponse.feeTotal,
      feeCut: feeInfoResponse.feeCut,
      initialized: feeInfoResponse.initialized,
    };
    updateFeeInfo({ feeInfo, chainId });
  }, [feeInfoResponse, updateFeeInfo, chainId]);

  return null;
}