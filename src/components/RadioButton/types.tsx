export type RadioButtonProps = {
  name?: string;
  /** id **/
  id?: string;
  /** label **/
  label?: string;
  /** called when state change **/
  onChange?: (value) => void;
  /** disable radio button **/
  disabled?: boolean;
  /** value of radio button **/
  value?: any;
  /** size of radio button **/
  size?: number;
  checked?: boolean;
};
