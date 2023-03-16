export type FeeTierProps = {
  feeTierName: string;
  description: string;
  selectedPercentage: number;
  selected: boolean;
  onSelectFeeTier: () => void;
};
