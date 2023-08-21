import { Interface } from '@ethersproject/abi';
import IPangolinPair from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/interfaces/IPangolinPair.sol/IPangolinPair.json';
import Pangochef from './pangochef.json';
import PangochefV1 from './pangochefV1.json';
import REWARDERVIAMULTIPLIER_ABI from './rewarder-via-multiplier.json';
import MiniChefV2 from '@pangolindex/exchange-contracts/artifacts/contracts/mini-chef/MiniChefV2.sol/MiniChefV2.json';
import StakingRewards from '@pangolindex/exchange-contracts/artifacts/contracts/staking-rewards/StakingRewards.sol/StakingRewards.json';

export const PANGOLIN_PAIR_INTERFACE = new Interface(IPangolinPair.abi);
export const REWARDER_VIA_MULTIPLIER_INTERFACE = new Interface(REWARDERVIAMULTIPLIER_ABI);

export const PANGOCHEF_ABI = Pangochef.abi;
export const PANGOCHEF_V1_ABI = PangochefV1.abi;
export const MINICHEFV2_ABI = MiniChefV2.abi;
export const STAKINGREWARDS_ABI  = StakingRewards.abi;