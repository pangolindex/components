import { Currency } from '@pangolindex/sdk';
import { Field } from 'src/state/pmint/elixir/atom';

export type SelectPairProps = {
  currency0?: Currency;
  currency1?: Currency;
  /**
   * Callback to open Token Drawer
   */
  onTokenClick: (tokenField: Field) => void;
  handleToggle: () => void;
};
