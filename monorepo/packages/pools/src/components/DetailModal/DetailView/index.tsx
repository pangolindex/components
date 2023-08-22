import { Box } from '@pangolindex/core';
import { CHAINS, ChefType } from '@pangolindex/sdk';
import { unwrappedToken, useChainId, useTranslation } from '@pangolindex/shared';
import { usePair } from '@pangolindex/state-hooks';
import React from 'react';
import { useWindowSize } from 'react-use';
import { useGetPoolDollerWorth } from 'src/hooks/minichef/hooks/common';
import { DoubleSideStakingInfo } from 'src/hooks/minichef/types';
import { PangoChefInfo } from 'src/hooks/pangochef/types';
import EarnWidget from '../../EarnWidget';
import EarnedDetailV3 from '../../PangoChef/EarnDetail';
import RemoveLiquidityWidget from '../../RemoveLiquidityWidget';
import Details from '../Details';
import EarnedDetail from '../EarnedDetail';
import Header from '../Header';
import { DesktopWrapper, DetailsWrapper, LeftSection, MobileWrapper, RightSection, Tab, Tabs } from './styleds';

export interface PoolDetailProps {
  onDismiss: () => void;
  stakingInfo: DoubleSideStakingInfo;
  version: number;
}

const DetailView = ({ stakingInfo, onDismiss, version }: PoolDetailProps) => {
  const { height } = useWindowSize();
  const chainId = useChainId();
  const { t } = useTranslation();
  const chain = CHAINS[chainId];

  const token0 = stakingInfo?.tokens?.[0];
  const token1 = stakingInfo?.tokens?.[1];

  const currency0 = unwrappedToken(token0, chainId);
  const currency1 = unwrappedToken(token1, chainId);

  const isStaking = Boolean(stakingInfo?.stakedAmount?.greaterThan('0'));

  const [, pair] = usePair(token0, token1);
  const { userPgl } = useGetPoolDollerWorth(pair);

  const renderWidget = () => {
    if (isStaking) {
      const miniChefType = chain.contracts?.mini_chef?.type;
      if (miniChefType === ChefType.PANGO_CHEF) {
        return <EarnedDetailV3 stakingInfo={stakingInfo as PangoChefInfo} version={version} />;
      }
      return <EarnedDetail stakingInfo={stakingInfo} version={version} />;
    }
    if (userPgl && userPgl?.greaterThan('0')) {
      return <RemoveLiquidityWidget currencyA={currency0} currencyB={currency1} />;
    }
    return null;
  };

  return (
    <>
      <MobileWrapper>
        <Header stakingInfo={stakingInfo} onClose={onDismiss} />
        <Box p={10}>
          {renderWidget()}
          <Box mt={isStaking ? '10px' : '0px'}>
            <EarnWidget currencyA={currency0} currencyB={currency1} version={version} stakingInfo={stakingInfo} />
          </Box>

          <Box mt={25}>
            <Tabs>
              <Tab>{t('votePage.details')}</Tab>
            </Tabs>
            <Details stakingInfo={stakingInfo} />
          </Box>
        </Box>
      </MobileWrapper>
      <DesktopWrapper style={{ maxHeight: height - 150 }}>
        <Header stakingInfo={stakingInfo} onClose={onDismiss} />
        <DetailsWrapper>
          <LeftSection>
            <Tabs>
              <Tab>{t('votePage.details')}</Tab>
            </Tabs>
            <Details stakingInfo={stakingInfo} />
          </LeftSection>
          <RightSection>
            <EarnWidget currencyA={currency0} currencyB={currency1} version={version} stakingInfo={stakingInfo} />
            {renderWidget()}
          </RightSection>
        </DetailsWrapper>
      </DesktopWrapper>
    </>
  );
};
export default DetailView;
