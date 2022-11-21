import { Contract } from '@ethersproject/contracts';
import { useEffect, useMemo } from 'react';
import { useChainId, useLibrary } from 'src/hooks';
import { AppState, useDispatch, useSelector } from 'src/state';
import { ZERO_ADDRESS } from '../../constants';
import { getRouterContractDaaS } from '../../utils';
import { NEVER_RELOAD, useSingleCallResult } from '../pmulticall/hooks';
import { updateFeeInfo } from './actions';

export default function Updater(): null {
  const chainId = useChainId();
  const { library } = useLibrary();
  const dispatch = useDispatch();

  const state = useSelector<AppState['pswap']>((state) => state.pswap);

  const feeTo = state[chainId]?.feeTo;

  const router: Contract | null = useMemo(() => {
    if (!chainId || !library || !feeTo || feeTo === ZERO_ADDRESS) return null;
    return getRouterContractDaaS(chainId, library);
  }, [chainId, library, feeTo]);

  const feeInfoResponse = useSingleCallResult(router, 'getFeeInfo', [feeTo], NEVER_RELOAD).result;

  useEffect(() => {
    if (!feeInfoResponse || !dispatch || !updateFeeInfo || !chainId) return;
    const feeInfo = {
      feePartner: feeInfoResponse.feePartner,
      feeProtocol: feeInfoResponse.feeProtocol,
      feeTotal: feeInfoResponse.feeTotal,
      feeCut: feeInfoResponse.feeCut,
      initialized: feeInfoResponse.initialized,
    };
    dispatch(updateFeeInfo({ feeInfo, chainId }));
  }, [feeInfoResponse, dispatch, updateFeeInfo, chainId]);

  return null;
}
