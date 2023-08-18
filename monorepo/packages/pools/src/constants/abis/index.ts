import { Interface } from '@ethersproject/abi';
import IPangolinPair from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/interfaces/IPangolinPair.sol/IPangolinPair.json';
import Pangochef from './pangochef.json';
import PangochefV1 from './pangochefV1.json';
import REWARDERVIAMULTIPLIER_ABI from './rewarder-via-multiplier.json';

export const PANGOLIN_PAIR_INTERFACE = new Interface(IPangolinPair.abi);
export const REWARDER_VIA_MULTIPLIER_INTERFACE = new Interface(REWARDERVIAMULTIPLIER_ABI);

export const PangochefABI = Pangochef.abi;
export const PangochefV1ABI = PangochefV1.abi;
