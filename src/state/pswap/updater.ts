import { Contract } from '@ethersproject/contracts';
import { useEffect, useMemo } from 'react';
import { useLibrary, usePangolinWeb3 } from 'src/hooks';
import { AppState, useDispatch, useSelector } from 'src/state';
import { ZERO_ADDRESS } from '../../constants';
import { getRouterContractDaaS } from '../../utils';
import { NEVER_RELOAD, useSingleCallResult } from '../pmulticall/hooks';
import { updateFeeInfo } from './actions';

export default function Updater(): null {
  const { chainId } = usePangolinWeb3();
  const { library } = useLibrary();
  const dispatch = useDispatch();

  const feeTo = useSelector<AppState['pswap']['feeTo']>((state) => state.pswap.feeTo);

  const router: Contract | null = useMemo(() => {
    if (!chainId || !library || !feeTo || feeTo === ZERO_ADDRESS) return null;
    return getRouterContractDaaS(chainId, library);
  }, [chainId, library, feeTo]);

  const feeInfoResponse = useSingleCallResult(router, 'getFeeInfo', [feeTo], NEVER_RELOAD).result;

  useEffect(() => {
    if (!feeInfoResponse || !dispatch || !updateFeeInfo) return;
    const feeInfo = {
      feePartner: feeInfoResponse.feePartner,
      feeProtocol: feeInfoResponse.feeProtocol,
      feeTotal: feeInfoResponse.feeTotal,
      feeCut: feeInfoResponse.feeCut,
      initialized: feeInfoResponse.initialized,
    };
    dispatch(updateFeeInfo({ feeInfo }));
  }, [feeInfoResponse, dispatch, updateFeeInfo]);

  return null;
}
