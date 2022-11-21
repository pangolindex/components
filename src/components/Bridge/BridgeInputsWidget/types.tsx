import { BridgeCurrency, Chain, CurrencyAmount } from '@pangolindex/sdk';

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
  currency?: BridgeCurrency;
  /**
   * Currency Amount
   */
  amount?: CurrencyAmount;
  /**
   * Currency Amount Net
   */
  amountNet?: string;
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
   * @param amount
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
