import { ElixirVaultProvider, Token } from '@pangolindex/sdk';

export type StatItemProps = {
  title: string;
  stat: string;
};

export type HeaderProps = {
  token0?: Token;
  token1?: Token;
  stakeActive: boolean;
  statItems: StatItemProps[];
  providers?: ElixirVaultProvider[];
  onClose: () => void;
};
