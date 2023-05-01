import { Token } from '@pangolindex/sdk';
import { StatItemProps } from '../types';

export type HeaderProps = {
  token0?: Token;
  token1?: Token;
  statItems: StatItemProps[];
  onClose: () => void;
};
