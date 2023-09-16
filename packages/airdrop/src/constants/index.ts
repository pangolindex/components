import Airdrop from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-token/Airdrop.sol/Airdrop.json';
import MerkleAirdrop from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-token/Merkledrop.sol/Merkledrop.json';
import MerkleAirdropToStaking from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-token/MerkledropToStaking.sol/MerkledropToStaking.json';
import MerkleAirdropCompliant from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-token/MerkledropToStakingCompliant.sol/MerkledropToStakingCompliant.json';
import { AirdropType } from '@pangolindex/sdk';

export const airdropAbiMapping = {
  [AirdropType.LEGACY]: Airdrop.abi,
  [AirdropType.MERKLE]: MerkleAirdrop.abi,
  [AirdropType.MERKLE_TO_STAKING]: MerkleAirdropToStaking.abi,
  [AirdropType.MERKLE_TO_STAKING_COMPLIANT]: MerkleAirdropCompliant.abi,
  [AirdropType.NEAR_AIRDROP]: undefined,
} as const;
