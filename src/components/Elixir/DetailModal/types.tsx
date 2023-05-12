import { PositionDetails } from 'src/state/pwallet/elixir/types';

export type DetailModalProps = {
  isOpen: boolean;
  position?: PositionDetails;
  onClose: () => void;
};

export type StatItemProps = {
  title: string;
  stat: string;
};
