export type ToggleButtonsProps = {
  name?: string;
  /** id **/
  id?: string;
  /** called when state change **/
  onChange?: (value) => void;
  value?: any;
  size?: number;
  options: Array<string>;
};
