import { BigNumber } from '@ethersproject/bignumber';

export interface URI {
  name: string;
  description: string;
  external_url: string;
  attributes: any[];
  image: string;
}

export interface Position {
  id: BigNumber;
  balance: BigNumber;
  sumOfEntryTimes: BigNumber;
  apr: BigNumber;
  rewardRate: BigNumber;
  pendingRewards: BigNumber;
  uri: URI;
}
