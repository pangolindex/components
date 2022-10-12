import { Chain, Currency, CurrencyAmount } from '@pangolindex/sdk';

export type BridgeInputsWidgetProps = {
  /**
   * Title of the widget
   */
  title?: string;
  /**
   * Disable Input field and show tooltip
   */
  inputDisabled: boolean;
  /**
   * Chain
   */
  chain?: Chain;
  /**
   * Currency
   */
  currency?: Currency;
  /**
   * Currency
   */
  amount?: CurrencyAmount;
  /**
   * Max currency amount
   */
  maxAmountInput?: CurrencyAmount;
  /**
   * Change amount to MAX
   */
  handleMaxInput?: () => void;
  /**
   * Change Amount
   */
  onChangeAmount?: (amount: string) => void;
  /**
   * Callback to open Chain Drawer
   */
  onChangeChainDrawerStatus?: () => void;
  /**
   * Callback to open Token Drawer
   */
  onChangeTokenDrawerStatus?: () => void;
};
