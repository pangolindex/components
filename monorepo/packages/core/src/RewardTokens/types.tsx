import { Token } from '@pangolindex/sdk';
import { LogoSize } from 'src/constants';

export interface RewardTokensProps {
  showNativeRewardToken?: boolean;
  size?: LogoSize;
  rewardTokens?: Array<Token | null | undefined> | null;
}
