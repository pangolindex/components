import { DEFIEDGE } from '@pangolindex/sdk';
import {
  DepositElixirVaultLiquidity,
  GetElixirVaultDetails,
  GetElixirVaults,
  ProviderVaultTokenApproveProcess,
  ProviderVaultTokenIsApproved,
  RemoveElixirVaultLiquidity,
} from '../types';
import {
  approveDefiEdgeStrategyToken,
  depositDefiEdgeLiquidity,
  getDefiEdgeVaultDetails,
  getDefiEdgeVaults,
  isDefiEdgeStrategyTokenApproved,
  removeDefiEdgeVaultLiquidity,
} from './defiedge';

type ElixirVaultProviderId = string;

export const getElixirVaultsFromProviders: { [key: ElixirVaultProviderId]: GetElixirVaults } = {
  [DEFIEDGE.id]: getDefiEdgeVaults,
};

export const getElixirVaultDetailFromProviders: { [key: ElixirVaultProviderId]: GetElixirVaultDetails } = {
  [DEFIEDGE.id]: getDefiEdgeVaultDetails,
};

export const depositElixirVaultLiquidity: { [key: ElixirVaultProviderId]: DepositElixirVaultLiquidity } = {
  [DEFIEDGE.id]: depositDefiEdgeLiquidity,
};

export const removeElixirVaultLiquidity: { [key: ElixirVaultProviderId]: RemoveElixirVaultLiquidity } = {
  [DEFIEDGE.id]: removeDefiEdgeVaultLiquidity,
};

export const isVaultTokenApproved: { [key: ElixirVaultProviderId]: ProviderVaultTokenIsApproved } = {
  [DEFIEDGE.id]: () => isDefiEdgeStrategyTokenApproved,
};

export const approveVaultToken: { [key: ElixirVaultProviderId]: ProviderVaultTokenApproveProcess } = {
  [DEFIEDGE.id]: () => approveDefiEdgeStrategyToken,
};
