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
   * Is Token Drawer Open
   */
  isTokenDrawerOpen?: boolean;
  /**
   * Callback to open Token Drawer
   */
  onChangeTokenDrawerStatus?: () => void;
};
