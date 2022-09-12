import { CHAINS, ChefType } from '@pangolindex/sdk';
import React from 'react';
import { useWindowSize } from 'react-use';
import { Box } from 'src/components';
import { useChainId } from 'src/hooks';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { StakingInfo } from 'src/state/pstake/types';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import EarnWidget from '../../EarnWidget';
import EarnedDetailV3 from '../../PangoChef/EarnDetail';
import Details from '../Details';
import EarnedDetail from '../EarnedDetail';
import Header from '../Header';
import { DesktopWrapper, DetailsWrapper, LeftSection, MobileWrapper, RightSection, Tab, Tabs } from './styleds';

export interface PoolDetailProps {
  onDismiss: () => void;
  stakingInfo: StakingInfo;
  version: number;
}

const DetailView = ({ stakingInfo, onDismiss, version }: PoolDetailProps) => {
  const { height } = useWindowSize();
  const chainId = useChainId();
  const chain = CHAINS[chainId];

  const token0 = stakingInfo?.tokens[0];
  const token1 = stakingInfo?.tokens[1];

  const currency0 = unwrappedToken(token0, chainId);
  const currency1 = unwrappedToken(token1, chainId);

  const isStaking = Boolean(stakingInfo?.stakedAmount?.greaterThan('0'));

  const renderEarnedDetail = () => {
    const miniChefType = chain.contracts?.mini_chef?.type;
    if (miniChefType === ChefType.PANGO_CHEF) {
      return <EarnedDetailV3 stakingInfo={stakingInfo as PangoChefInfo} version={version} />;
    }
    return <EarnedDetail stakingInfo={stakingInfo} version={version} />;
  };

  return (
    <>
      <MobileWrapper>
        <Header stakingInfo={stakingInfo} version={version} onClose={onDismiss} />
        <Box p={10}>
          {isStaking && renderEarnedDetail()}
          <Box mt={isStaking ? '10px' : '0px'}>
            <EarnWidget currencyA={currency0} currencyB={currency1} version={version} stakingInfo={stakingInfo} />
          </Box>

          <Box mt={25}>
            <Tabs>
              <Tab>Details</Tab>
            </Tabs>
            <Details stakingInfo={stakingInfo} />
          </Box>
        </Box>
      </MobileWrapper>
      <DesktopWrapper style={{ maxHeight: height - 150 }}>
        <Header stakingInfo={stakingInfo} version={version} onClose={onDismiss} />
        <DetailsWrapper>
          <LeftSection>
            <Tabs>
              <Tab>Details</Tab>
            </Tabs>
            <Details stakingInfo={stakingInfo} />
          </LeftSection>
          <RightSection>
            <EarnWidget currencyA={currency0} currencyB={currency1} version={version} stakingInfo={stakingInfo} />
            {isStaking && renderEarnedDetail()}
          </RightSection>
        </DetailsWrapper>
      </DesktopWrapper>
    </>
  );
};
export default DetailView;
