import * as React from 'react';

export interface StepsProps {
  current?: number;
  initial?: number;
  progressDot?: boolean;
  allowChangeOnClick?: boolean;
  onChange?: (current: number) => void;
  children?: React.ReactNode;
}

export interface StepProps {
  onStepClick?: (index: number) => void;
  disabled?: boolean;
  title?: React.ReactNode;
  completed?: boolean;
  active?: boolean;
  stepIndex?: number;
  stepNumber?: number;
  progressDot?: boolean;
}
