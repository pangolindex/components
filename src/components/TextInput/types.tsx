import * as React from 'react';

export type ReactInputKeyboardEvent = React.KeyboardEvent<HTMLInputElement>;

export type TextInputProps = Omit<React.HTMLProps<HTMLInputElement>, 'accept' | 'ref'> & {
  addonAfter?: React.ReactNode | null;

  addonBefore?: React.ReactNode | null;
  /** Standard HTML input autocomplete attribute. */
  autoComplete?: string | 'on' | 'off';
  /** Type value to be passed to the html input. */
  error?: string | string[];
  /** show error message or not when input state is invalid,
   it is to hide error message only , it will still show invalid state of input field. */
  showErrorMessage?: boolean;
  /** Label to be displayed above the input. */
  label?: string;
  addonLabel?: React.ReactNode | null;
  id?: string;
  fontSize?: number;
  isNumeric?: boolean;
  onChange?: (value: string) => void;
  getRef?: (ref: any) => void;
};
