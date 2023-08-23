import { PositionDetails } from 'src/state/wallet/elixir/types';

export interface RemoveDrawerProps {
  isOpen: boolean;
  position?: PositionDetails;
  onClose: () => void;
}
