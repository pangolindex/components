import { Interface } from '@ethersproject/abi';
import StakingRewards from '@pangolindex/exchange-contracts/artifacts/contracts/staking-rewards/StakingRewards.sol/StakingRewards.json';

const STAKING_REWARDS_INTERFACE = new Interface(StakingRewards.abi);

export { STAKING_REWARDS_INTERFACE };
