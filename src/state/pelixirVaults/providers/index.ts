import { DEFIEDGE } from '@pangolindex/sdk';
import { GetElixirVaults } from '../types';
import { getDefiEdgeVaults } from './defiedge';

type ElixirVaultProviderId = string;

export const getElixirVaultsFromProviders: { [key: ElixirVaultProviderId]: GetElixirVaults } = {
  [DEFIEDGE.id]: getDefiEdgeVaults,
};
