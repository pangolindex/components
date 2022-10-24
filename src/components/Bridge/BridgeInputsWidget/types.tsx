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
   * Max currency amount
   */
  maxAmountInput?: CurrencyAmount;
  /**
   * Recipient address
   */
  recipient?: string | null | undefined;
  /**
   * Callback when recipient input changes
   * @param recipient
   */
  onChangeRecipient?: (recipient: string) => void;
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
