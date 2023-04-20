import { PositionDetails } from 'src/state/pwallet/concentratedLiquidity/types';

export interface RemoveDrawerProps {
  isOpen: boolean;
  position?: PositionDetails;
  onClose: () => void;
}
