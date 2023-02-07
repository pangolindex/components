import { LIFI, RANGO, SQUID } from '@pangolindex/sdk';
import { GetRoutes } from '../types';
import { getLiFiRoutes } from './lifi';
import { getRangoRoutes } from './rango';
import { getSquidRoutes } from './squid';

type BridgeId = string;

export const getRoutesProviders: { [key: BridgeId]: GetRoutes } = {
  [RANGO.id]: getRangoRoutes,
  [LIFI.id]: getLiFiRoutes,
  [SQUID.id]: getSquidRoutes,
};
