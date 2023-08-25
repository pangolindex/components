import { Interface } from '@ethersproject/abi';

import IElixirPoolStateABI from './IElixirPoolState.json';

const ELIXIR_POOL_STATE_INTERFACE = new Interface(IElixirPoolStateABI);

export { ELIXIR_POOL_STATE_INTERFACE };
