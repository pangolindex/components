import { ThemeColorsType } from '@pangolindex/shared';
import * as React from 'react';

export type OutofRangeWarningProps = {
  label?: string;
  labelColor?: ThemeColorsType;
  addonLabel?: React.ReactNode | null;
  id?: string;
  fontSize?: number;
  message: string;
};
