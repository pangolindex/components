import { Contract } from '@ethersproject/contracts';
import { useEffect, useMemo } from 'react';
import { useChainId, useLibrary } from 'src/hooks';
import { ZERO_ADDRESS } from '../../constants';
import { getRouterContractDaaS } from '../../utils';
import { NEVER_RELOAD, useSingleCallResult } from '../pmulticall/hooks';
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
