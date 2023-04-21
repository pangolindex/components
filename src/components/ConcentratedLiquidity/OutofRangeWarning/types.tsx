import * as React from 'react';
import { ThemeColorsType } from 'src/theme';

export type OutofRangeWarningProps = {
  label?: string;
  labelColor?: ThemeColorsType;
  addonLabel?: React.ReactNode | null;
  id?: string;
  fontSize?: number;
  message: string;
};
