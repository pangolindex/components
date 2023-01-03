import { BridgeChain, BridgeCurrency, CurrencyAmount } from '@pangolindex/sdk';

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
   * BridgeChain
   */
  chain?: BridgeChain;
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
   * Recipient address
   */
  recipient?: string | null;
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
