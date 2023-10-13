import { Interface } from '@ethersproject/abi';

import Png from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-token/Png.sol/Png.json';
import GovernorAlpha from '@pangolindex/governance/artifacts/contracts/GovernorAlpha.sol/GovernorAlpha.json';
import ProposalStorage from './ProposalStorage.json';
import GovernorPango from '@pangolindex/exchange-contracts/artifacts/contracts/governance/GovernorPango.sol/GovernorPango.json';
import GovernorPangoHedera from './GovernorPangoHedera.json';

export const PROPOSAL_STORAGE_INTERFACE = new Interface(ProposalStorage.abi);

export const GovernorAlphaABI = GovernorAlpha.abi;
export const PNGABI = Png.abi;
export const GovernorPangoABI = GovernorPango.abi;
export const GovernorPangoHederaABI = GovernorPangoHedera.abi;