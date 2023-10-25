import { DEFIEDGE } from '@pangolindex/sdk';
import {
  DepositElixirVaultLiquidity,
  GetElixirVaultDetails,
  GetElixirVaults,
  RemoveElixirVaultLiquidity,
} from '../types';
import {
  depositDefiEdgeLiquidity,
  getDefiEdgeVaultDetails,
  getDefiEdgeVaults,
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
