import { Currency, ElixirPool } from '@pangolindex/sdk';

export type PoolCardProps = {
  pool: ElixirPool;
  onClick: (currency0: Currency, currency1: Currency) => void;
};
