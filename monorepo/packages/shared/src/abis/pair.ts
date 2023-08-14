import { Interface } from '@ethersproject/abi';
import IPangolinPair from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/interfaces/IPangolinPair.sol/IPangolinPair.json';

const PAIR_INTERFACE = new Interface(IPangolinPair.abi);

export { PAIR_INTERFACE };
