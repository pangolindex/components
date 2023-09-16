export type SwitchProps = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  onHandleColor?: string;
  offHandleColor?: string;
  onColor?: string;
  offColor?: string;
  uncheckedIcon?: React.ReactElement | boolean;
  checkedIcon?: React.ReactElement | boolean;
  height?: number;
  width?: number;
};
