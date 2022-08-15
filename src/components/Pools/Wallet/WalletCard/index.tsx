import { Pair } from '@pangolindex/sdk';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, DoubleCurrencyLogo, Stat, Text } from 'src/components';
import { useChainId } from 'src/hooks';
import { useGetPoolDollerWorth } from 'src/state/pstake/hooks';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import AddLiquidityDrawer from '../../AddLiquidityDrawer';
import RemoveLiquidityDrawer from '../../RemoveLiquidityDrawer';
import { ActionButon, DetailButton, Divider, InnerWrapper, Panel, StatWrapper } from './styleds';

export interface WalletCardProps {
  pair: Pair;
}

const WalletCard = ({ pair }: WalletCardProps) => {
  const { t } = useTranslation();
  const chainId = useChainId();
  const [isRemoveLiquidityDrawerVisible, setShowRemoveLiquidityDrawer] = useState(false);
  const [isAddLiquidityDrawerVisible, setShowAddLiquidityDrawer] = useState(false);

  const currency0 = unwrappedToken(pair.token0, chainId);
  const currency1 = unwrappedToken(pair.token1, chainId);

  const { liquidityInUSD, userPgl } = useGetPoolDollerWorth(pair);
  const yourLiquidity = liquidityInUSD ? `$${liquidityInUSD?.toFixed(4)}` : '-';

  return (
    <Panel>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Text color="text1" fontSize={[24, 18]} fontWeight={500}>
            {currency0.symbol}-{currency1.symbol}
          </Text>
        </Box>

        <DoubleCurrencyLogo size={48} currency0={currency0} currency1={currency1} />
      </Box>
      <Divider />

      <StatWrapper>
        <Stat
          title={t('pool.yourLiquidity')}
          stat={yourLiquidity}
          titlePosition="top"
          titleFontSize={16}
          statFontSize={[24, 18]}
        />

        <Stat
          title={t('positionCard.poolTokens')}
          stat={userPgl ? userPgl.toSignificant(4) : '-'}
          titlePosition="top"
          titleFontSize={16}
          statFontSize={[24, 18]}
        />
      </StatWrapper>

      <InnerWrapper>
        <Box>
          <DetailButton variant="plain" onClick={() => setShowAddLiquidityDrawer(true)} color="text1" height="45px">
            {t('positionCard.add')}
          </DetailButton>
        </Box>
        <Box>
          <ActionButon
            variant="plain"
            onClick={() => setShowRemoveLiquidityDrawer(true)}
            backgroundColor="bg2"
            color="text1"
            height="45px"
          >
            {t('positionCard.remove')}
          </ActionButon>
        </Box>
      </InnerWrapper>

      {isAddLiquidityDrawerVisible && (
        <AddLiquidityDrawer
          isOpen={isAddLiquidityDrawerVisible}
          onClose={() => {
            setShowAddLiquidityDrawer(false);
          }}
          clickedLpTokens={[pair?.token0, pair?.token1]}
          backgroundColor="color5"
        />
      )}

      {isRemoveLiquidityDrawerVisible && (
        <RemoveLiquidityDrawer
          isOpen={isRemoveLiquidityDrawerVisible}
          onClose={() => {
            setShowRemoveLiquidityDrawer(false);
          }}
          clickedLpTokens={[pair?.token0, pair?.token1]}
          backgroundColor="color5"
        />
      )}
    </Panel>
  );
};

export default WalletCard;
