import { Token } from '@pangolindex/sdk';
import { PangoChefInfo } from '../types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export function useDummyPangoChefInfos() {
  return [] as PangoChefInfo[];
}

export function useDummyPangoChefCallback(): { callback: null | (() => Promise<string>); error: string | null } {
  return { callback: null, error: null };
}

export function useDummyIsLockingPoolZero() {
  const _pairs: [Token, Token][] = [];

  return _pairs;
}
