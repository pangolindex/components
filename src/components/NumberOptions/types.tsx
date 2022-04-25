export interface NumberOptionsProps {
  options?: number[];
  isPercentage?: boolean;
  onChange: (value: number) => void;
  currentValue: number;
  isDisabled?: boolean;
  variant: 'step' | 'box';
}
