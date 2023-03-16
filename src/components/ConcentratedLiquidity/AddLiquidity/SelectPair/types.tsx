import { Currency } from '@pangolindex/sdk';
import { TokenField } from '..';

export type SelectPairProps = {
  currency0?: Currency;
  currency1?: Currency;
  /**
   * Callback to open Token Drawer
   */
  onChangeTokenDrawerStatus?: (tokenField: TokenField) => void;
};
