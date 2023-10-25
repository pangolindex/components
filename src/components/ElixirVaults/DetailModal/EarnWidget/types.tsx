import { ElixirVault } from 'src/state/pelixirVaults/types';
import { DoubleSideStakingInfo } from 'src/state/pstake/types';

export type EarnWidgetProps = {
  vault?: ElixirVault;
  stakingInfo?: DoubleSideStakingInfo;
};
