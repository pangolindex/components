import { DEFIEDGE } from '@pangolindex/sdk';
import { GetElixirVaultDetails, GetElixirVaults } from '../types';
import { getDefiEdgeVaultDetails, getDefiEdgeVaults } from './defiedge';

type ElixirVaultProviderId = string;

export const getElixirVaultsFromProviders: { [key: ElixirVaultProviderId]: GetElixirVaults } = {
  [DEFIEDGE.id]: getDefiEdgeVaults,
};

export const getElixirVaultDetailFromProviders: { [key: ElixirVaultProviderId]: GetElixirVaultDetails } = {
  [DEFIEDGE.id]: getDefiEdgeVaultDetails,
};
