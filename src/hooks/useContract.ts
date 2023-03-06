import { Contract } from '@ethersproject/contracts';
import MiniChefV2 from '@pangolindex/exchange-contracts/artifacts/contracts/mini-chef/MiniChefV2.sol/MiniChefV2.json';
import IPangolinPair from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/interfaces/IPangolinPair.sol/IPangolinPair.json';
import Png from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-token/Png.sol/Png.json';
import StakingRewards from '@pangolindex/exchange-contracts/artifacts/contracts/staking-rewards/StakingRewards.sol/StakingRewards.json';
import { ChainId, WAVAX } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { ZERO_ADDRESS } from 'src/constants';
import { ERC20_BYTES32_ABI } from 'src/constants/abis/erc20';
import ERC20_ABI from 'src/constants/abis/erc20.json';
import PANGOCHEF_ABI from 'src/constants/abis/pangochef.json';
import PANGOCHEF_V1_ABI from 'src/constants/abis/pangochefV1.json';
import { REWARDER_VIA_MULTIPLIER_INTERFACE } from 'src/constants/abis/rewarderViaMultiplier';
import SarStaking from 'src/constants/abis/sar.json';
import WETH_ABI from 'src/constants/abis/weth.json';
import { MINICHEF_ADDRESS, PANGOCHEF_ADDRESS, SAR_STAKING_ADDRESS } from 'src/constants/address';
import { MULTICALL_ABI, MULTICALL_NETWORKS } from 'src/constants/multicall';
import { PNG } from 'src/constants/tokens';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { getContract } from 'src/utils';
import { hederaFn } from 'src/utils/hedera';

// returns null on errors
export function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { account } = usePangolinWeb3();
  const { library } = useLibrary();

  return useMemo(() => {
    if (!address || address === ZERO_ADDRESS || !ABI || !library) return null;
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined);
    } catch (error) {
      console.error('Failed to get contract', error);
      return null;
    }
  }, [address, ABI, library, withSignerIfPossible, account]);
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible);
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible);
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = usePangolinWeb3();
  return useContract(chainId ? WAVAX[chainId]?.address : undefined, WETH_ABI, withSignerIfPossible);
}

export function useMulticallContract(): Contract | null {
  const { chainId } = usePangolinWeb3();
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false);
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  const chainId = useChainId();
  return useContract(
    stakingAddress,
    stakingAddress === MINICHEF_ADDRESS[chainId] ? MiniChefV2.abi : StakingRewards.abi,
    withSignerIfPossible,
  );
}

export function useMiniChefContract(): Contract | null {
  const chainId = useChainId();
  return useContract(MINICHEF_ADDRESS[chainId], MiniChefV2.abi, true);
}

export function useRewardViaMultiplierContract(address?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, REWARDER_VIA_MULTIPLIER_INTERFACE, withSignerIfPossible);
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IPangolinPair.abi, withSignerIfPossible);
}

export function usePngContract(): Contract | null {
  const chainId = useChainId();
  return useContract(PNG[chainId].address, Png.abi, true);
}

export function useSarStakingContract(): Contract | null {
  const chainId = useChainId();
  return useContract(SAR_STAKING_ADDRESS[chainId], SarStaking, true);
}

// this is designed for Hedera
export function useHederaSarNFTContract() {
  const chainId = useChainId();
  const sarContractAddress = SAR_STAKING_ADDRESS[chainId];

  let nftTokenAddress: string | undefined = undefined;

  if (sarContractAddress && hederaFn.isHederaChain(chainId)) {
    const sarContractId = hederaFn.hederaId(sarContractAddress ?? '');
    const nftTokenId = hederaFn.contractToTokenId(sarContractId);
    nftTokenAddress = hederaFn.idToAddress(nftTokenId);
  }

  return useContract(nftTokenAddress, SarStaking, true);
}

export function usePangoChefContract(): Contract | null {
  const chainId = useChainId();
  // for Songbird Chain Specifically we are using Old PangoChef V1 due to historical reasons
  // all new chain we are using new pangochef v2
  let abi: any;
  if (chainId === ChainId.SONGBIRD || chainId === ChainId.COSTON) {
    abi = PANGOCHEF_V1_ABI.abi;
  } else {
    abi = PANGOCHEF_ABI.abi;
  }
  return useContract(PANGOCHEF_ADDRESS[chainId], abi, true);
}
