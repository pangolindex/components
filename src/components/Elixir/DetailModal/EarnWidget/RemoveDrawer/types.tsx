import { PositionDetails } from 'src/state/pwallet/elixir/types';

export interface RemoveDrawerProps {
  isOpen: boolean;
  position?: PositionDetails;
  onClose: () => void;
}
