export type CountdownCounterProps = {
  value: number;
  minValue: number;
  maxValue: number;
  text?: string;
  strokeWidth?: number;
  background?: boolean;
  backgroundPadding?: number;
  counterClockwise?: boolean;
  circleRatio?: number;
  onFinish?: () => void;
};
