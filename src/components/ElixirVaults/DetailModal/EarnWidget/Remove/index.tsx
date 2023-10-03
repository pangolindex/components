import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, ToggleButtons } from 'src/components';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { ElixirVault } from 'src/state/pelixirVaults/types';
import { useTokenBalance } from 'src/state/pwallet/hooks/evm';
import RemoveLiquidity from '../RemoveLiquidity';
import { RemoveWrapper } from './styleds';

enum REMOVE_TYPE {
  FARM = 'Farm',
  LIQUIDITY = 'Liquidity',
}

interface WithdrawProps {
  vault?: ElixirVault;
}

// TODO: Remove static data
const stakedAmount = 4; // Farm
const defaultType = REMOVE_TYPE.LIQUIDITY;

const Remove = ({ vault }: WithdrawProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  // const userLiquidityUnstaked = useTokenBalance(account ?? undefined, vault?.address ?? undefined); // TODO:
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, PNG[chainId] ?? undefined); // TODO:
  const [removeType, setRemoveType] = useState(defaultType);

  const [showRemoveTab, setShowRemoveTab] = useState<boolean>(true);
  const { t } = useTranslation();

  function onComplete(percetage: number, type: REMOVE_TYPE) {
    if (percetage >= 100) {
      // if remove all from farm it will show the liquidity tab
      if (type === REMOVE_TYPE.FARM) {
        setRemoveType(REMOVE_TYPE.LIQUIDITY);
      } else {
        // if remove all liquidity and have a stake in farm it show farm tab
        if (stakedAmount && stakedAmount > 0) {
          setRemoveType(REMOVE_TYPE.FARM);
        }
      }
    }
  }

  const renderRemoveContent = () => {
    if (!!userLiquidityUnstaked && Number(userLiquidityUnstaked) > 0 && vault) {
      return (
        <RemoveLiquidity
          vault={vault}
          userLiquidityUnstaked={userLiquidityUnstaked.toFixed(8)}
          onLoading={(isLoadingOrComplete: boolean) => {
            setShowRemoveTab(!isLoadingOrComplete);
          }}
          onComplete={(percetage) => {
            onComplete(percetage, REMOVE_TYPE.LIQUIDITY);
          }}
        />
      );
    } else {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Text color="text2" fontSize={16} fontWeight={500} textAlign="center">
            {t('pool.noLiquidity')}
          </Text>
        </Box>
      );
    }
  };

  return (
    <RemoveWrapper>
      {showRemoveTab && (
        <Box mt="5px" width="100%" mb="5px">
          <ToggleButtons
            options={[REMOVE_TYPE.FARM, REMOVE_TYPE.LIQUIDITY]}
            value={removeType}
            onChange={(value) => {
              setRemoveType(value);
            }}
          />
        </Box>
      )}

      {removeType === REMOVE_TYPE.FARM ? <div>Test</div> : renderRemoveContent()}
    </RemoveWrapper>
  );
};
export default Remove;
