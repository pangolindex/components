import { Token } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { PangoChefInfo } from '../types';

export function useDummyPangoChefInfos() {
  return useMemo(() => [] as PangoChefInfo[], []);
}

export function useDummyPangoChefCallback(): { callback: null | (() => Promise<string>); error: string | null } {
  return useMemo(() => ({ callback: null, error: null }), []);
}

export function useDummyIsLockingPoolZero() {
  return useMemo(() => [] as [Token, Token][], []);
}
