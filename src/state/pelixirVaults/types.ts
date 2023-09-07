import { Chain, ElixirVaultProvider, Token } from '@pangolindex/sdk';

export type ElixirVault = {
  selected: boolean;
  id: string;
  poolTokens: Token[];
  strategyProvider: ElixirVaultProvider[];
  sharePrice: string;
  incentivized: boolean;
  feesApr: string;
  incentivizationApr: string;
};

export type GetElixirVaultsProps = {
  chain: Chain;
};

export type GetElixirVaults = (props: GetElixirVaultsProps) => Promise<ElixirVault[]>;

export enum CurrencyField {
  CURRENCY0 = 'CURRENCY0',
  CURRENCY1 = 'CURRENCY1',
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export type SendTransactionFunc = (selectedElixirVault?: ElixirVault, account?: string | null) => Promise<void>;

export type SendTransaction = {
  defiedge: SendTransactionFunc;
  ichi: SendTransactionFunc;
};

export type DefiEdgeAllStrategyData = {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  updatedAt: string;
  network: string;
  sharePrice: number;
  address: string;
  aum: number;
  createdAt: string;
  since_inception: {
    USD: number;
    BTC: number;
    MATIC: number;
    ETH: number;
  };
};
