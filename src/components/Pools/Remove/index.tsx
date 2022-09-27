import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, ToggleButtons } from 'src/components';
import { useChainId } from 'src/hooks';
import { useDerivedBurnInfo } from 'src/state/pburn/hooks';
import { StakingInfo } from 'src/state/pstake/types';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import RemoveFarm from '../RemoveFarm';
import RemoveLiquidity from '../RemoveLiquidity';
import { RemoveWrapper } from './styleds';

enum REMOVE_TYPE {
  FARM = 'Farm',
  LIQUIDITY = 'Liquidity',
}

interface WithdrawProps {
  stakingInfo: StakingInfo;
  version: number;
  onClose: () => void;
  redirectToCompound?: () => void;
}
const Remove = ({ stakingInfo, version, onClose, redirectToCompound }: WithdrawProps) => {
  const chainId = useChainId();
  const [removeType, setRemoveType] = useState(
    stakingInfo.stakedAmount?.greaterThan('0') ? (REMOVE_TYPE.FARM as string) : (REMOVE_TYPE.LIQUIDITY as string),
  );

  const [showRemoveTab, setShowRemoveTab] = useState<boolean>(true);
  const { t } = useTranslation();
  const token0 = stakingInfo.tokens[0];
  const token1 = stakingInfo.tokens[1];

  const currencyA = unwrappedToken(token0, chainId);
  const currencyB = unwrappedToken(token1, chainId);

  const { userLiquidity } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined);

  const renderRemoveContent = () => {
    if (!!userLiquidity && Number(userLiquidity?.toSignificant()) > 0) {
      return (
        <RemoveLiquidity
          currencyA={currencyA}
          currencyB={currencyB}
          onLoadingOrComplete={(isLoadingOrComplete: boolean) => {
            setShowRemoveTab(!isLoadingOrComplete);
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

      {removeType === REMOVE_TYPE.FARM ? (
        <RemoveFarm
          stakingInfo={stakingInfo}
          onClose={onClose}
          version={version}
          onLoadingOrComplete={(isLoadingOrComplete: boolean) => {
            setShowRemoveTab(!isLoadingOrComplete);
          }}
          redirectToCompound={redirectToCompound}
        />
      ) : (
        renderRemoveContent()
      )}
    </RemoveWrapper>
  );
};
export default Remove;
