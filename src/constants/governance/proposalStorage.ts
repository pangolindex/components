import { Interface } from '@ethersproject/abi';

import ProposalStorage from './ProposalStorage.json';

const PROPOSAL_STORAGE_INTERFACE = new Interface(ProposalStorage.abi);

export { PROPOSAL_STORAGE_INTERFACE };
