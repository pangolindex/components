import { getAddress } from '@ethersproject/address';
import { Contract } from '@ethersproject/contracts';
import MiniChefV2 from '@pangolindex/exchange-contracts/artifacts/contracts/mini-chef/MiniChefV2.sol/MiniChefV2.json';
import IPangolinPair from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/interfaces/IPangolinPair.sol/IPangolinPair.json';
import Png from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-token/Png.sol/Png.json';
import StakingRewards from '@pangolindex/exchange-contracts/artifacts/contracts/staking-rewards/StakingRewards.sol/StakingRewards.json';
import { WAVAX } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { MINICHEF_ADDRESS, PANGOCHEF_ADDRESS, SAR_STAKING_ADDRESS, ZERO_ADDRESS } from 'src/constants';
import { ERC20_BYTES32_ABI } from 'src/constants/abis/erc20';
import ERC20_ABI from 'src/constants/abis/erc20.json';
import PANGOCHEF_ABI from 'src/constants/abis/pangochef.json';
import { REWARDER_VIA_MULTIPLIER_INTERFACE } from 'src/constants/abis/rewarderViaMultiplier';
import SarStaking from 'src/constants/abis/sar.json';
import WETH_ABI from 'src/constants/abis/weth.json';
import { MULTICALL_ABI, MULTICALL_NETWORKS } from 'src/constants/multicall';
import { PNG } from 'src/constants/tokens';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { getContract, getProviderOrSigner } from 'src/utils';

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
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

/**
 * This function is used to return ethers contract instance without isAddress check because some address from Hedera is not valid Ethereum address
 * @param address address of contract
 * @param ABI ABI of contract
 * @param withSignerIfPossible whether to use signer (if it exists) to sign messages or not
 * @returns Return's Ethers Contract Instance
 */
function useHederaContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { account } = usePangolinWeb3();
  const { library } = useLibrary();

  return useMemo(() => {
    if (!address || address === ZERO_ADDRESS || !ABI || !library) return null;
    try {
      return new Contract(
        address,
        ABI,
        getProviderOrSigner(library, withSignerIfPossible && account ? account : undefined) as any,
      );
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
export function useSarNFTStakingContract() {
  const chainId = useChainId();
  const sarContractAddress = SAR_STAKING_ADDRESS[chainId];

  let address: string | undefined = undefined;
  if (sarContractAddress) {
    // for hedera we need to add 1 to contract address to get the nft/token contract address, it happens because the nft/tokens have different contract
    // eg. 0.0.49031363 is contract address it's only possible to call positions, rewardRate, etc...
    // 0.0.49031364 is nft contract address it's only possible to call tokenURI, balanceOf, etc..., the available fuctions of ERC721 interface
    const _address = (Number(sarContractAddress) + 1).toString(16);
    // need to fill rest of address to get valid address
    address = getAddress('0x' + new Array(41 - _address.length).join('0') + _address);
  }
  return useHederaContract(address, SarStaking, true);
}

export function usePangoChefContract(): Contract | null {
  const chainId = useChainId();
  return useContract(PANGOCHEF_ADDRESS[chainId], PANGOCHEF_ABI.abi, true);
}
