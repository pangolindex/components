import { MINICHEF_ADDRESS, PANGOCHEF_ADDRESS, useChainId, useContract } from '@pangolindex/shared';
import { ChainId } from '@pangolindex/sdk';
import { MINICHEFV2_ABI, PANGOCHEF_ABI, PANGOCHEF_V1_ABI, STAKINGREWARDS_ABI } from 'src/constants/abis';

export function useMiniChefContract() {
  const chainId = useChainId();
  return useContract(MINICHEF_ADDRESS[chainId], MINICHEFV2_ABI, true);
}

export function usePangoChefContract(){
  const chainId = useChainId();
  // for Songbird Chain Specifically we are using Old PangoChef V1 due to historical reasons
  // all new chain we are using new pangochef v2
  let abi: any;
  if (chainId === ChainId.SONGBIRD || chainId === ChainId.COSTON) {
    abi = PANGOCHEF_V1_ABI;
  } else {
    abi = PANGOCHEF_ABI;
  }
  return useContract(PANGOCHEF_ADDRESS[chainId], abi, true);
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean) {
  const chainId = useChainId();
  return useContract(
    stakingAddress,
    stakingAddress === MINICHEF_ADDRESS[chainId] ? MINICHEFV2_ABI : STAKINGREWARDS_ABI,
    withSignerIfPossible,
  );
}
