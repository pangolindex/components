import { Interface } from '@ethersproject/abi';

import IPangolinV2PoolStateABI from './IPangolinV2PoolState.json';

const CONCENTRATE_POOL_STATE_INTERFACE = new Interface(IPangolinV2PoolStateABI);

export { CONCENTRATE_POOL_STATE_INTERFACE };
