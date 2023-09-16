import { PositionDetails } from 'src/state/wallet/types';

export interface RemoveDrawerProps {
  isOpen: boolean;
  position?: PositionDetails;
  onClose: () => void;
}
