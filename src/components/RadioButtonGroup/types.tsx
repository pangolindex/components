export type RadioButtonGroupProps = {
  name?: string;
  /** id **/
  id?: string;
  /** called when state change **/
  onChange?: (value) => void;
  /** value of radio button **/
  value?: any;
  /** size of radio button **/
  size?: number;

  options: Array<{ label: string; value: any }>;

  type: 'horizontal' | 'verticle';
};
