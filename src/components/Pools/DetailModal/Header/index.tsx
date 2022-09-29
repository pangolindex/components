import { CHAINS, ChefType } from '@pangolindex/sdk';
import numeral from 'numeral';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, DoubleCurrencyLogo, Stat, Text } from 'src/components';
import { useChainId } from 'src/hooks';
import { useUserPangoChefAPR } from 'src/state/ppangoChef/hooks';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { useGetFarmApr, useGetRewardTokens } from 'src/state/pstake/hooks';
import { StakingInfo } from 'src/state/pstake/types';
import { CloseIcon, Hidden, Visible } from 'src/theme/components';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import RewardTokens from '../../RewardTokens';
import { HeaderRoot, HeaderWrapper, StatsWrapper } from './styled';

type Props = {
  stakingInfo: StakingInfo;
  version: number;
  onClose: () => void;
};

const Header: React.FC<Props> = ({ stakingInfo, version, onClose }) => {
  const theme = useContext(ThemeContext);
  const chainId = useChainId();

  const { t } = useTranslation();

  const token0 = stakingInfo?.tokens[0];
  const token1 = stakingInfo?.tokens[1];

  const currency0 = unwrappedToken(token0, chainId);
  const currency1 = unwrappedToken(token1, chainId);

  const rewardTokens = useGetRewardTokens(stakingInfo?.rewardTokens, stakingInfo.rewardTokensAddress);

  const { swapFeeApr: _swapFeeApr, stakingApr: _stakingApr } = useGetFarmApr(stakingInfo?.pid as string);

  const stakingApr = version !== 2 ? stakingInfo?.stakingApr || 0 : _stakingApr;

  const swapFeeApr = version !== 2 ? stakingInfo?.swapFeeApr || 0 : _swapFeeApr;

  const totalApr = stakingApr + swapFeeApr;

  const cheftType = CHAINS[chainId].contracts?.mini_chef?.type ?? ChefType.MINI_CHEF_V2;

  // old calculation, it's using if the userRewardRate is not broken
  //userApr = userRewardRate(POOL_ID, USER_ADDRESS) * 365 days * 100 * PNG_PRICE / (getUser(POOL_ID, USER_ADDRESS).valueVariables.balance * STAKING_TOKEN_PRICE)

  const userApr = useUserPangoChefAPR(cheftType === ChefType.PANGO_CHEF ? (stakingInfo as PangoChefInfo) : undefined);

  return (
    <HeaderRoot>
      <HeaderWrapper>
        <Box display="flex" alignItems="center">
          <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={48} />
          <Text color="text1" fontSize={[24, 18]} fontWeight={500} marginLeft={10}>
            {currency0?.symbol}/{currency1?.symbol}
          </Text>
        </Box>
        <Visible upToSmall={true}>
          <CloseIcon onClick={onClose} color={theme.text3} />
        </Visible>
      </HeaderWrapper>

      <StatsWrapper cheftType={cheftType}>
        <Box display="inline-block">
          <Text color="text2" fontSize={14}>
            {t('earn.poolRewards')}
          </Text>

          <Box display="flex" alignItems="center" mt="8px">
            <RewardTokens rewardTokens={rewardTokens} size={24} />
          </Box>
        </Box>
        {cheftType === ChefType.PANGO_CHEF && stakingInfo.stakedAmount.greaterThan('0') && (
          <Stat
            title={`Your APR:`}
            stat={`${numeral(userApr).format('0.00a')}%`}
            titlePosition="top"
            titleFontSize={14}
            statFontSize={[24, 18]}
            titleColor="text2"
          />
        )}
        <Stat
          title={`Swap fee APR:`}
          stat={swapFeeApr && !stakingInfo.isPeriodFinished ? `${numeral(swapFeeApr).format('0a')}%` : '-'}
          titlePosition="top"
          titleFontSize={14}
          statFontSize={[24, 18]}
          titleColor="text2"
        />
        <Stat
          title={`Reward APR:`}
          stat={!stakingInfo.isPeriodFinished ? `${numeral(stakingApr).format('0a')}%` : '-'}
          titlePosition="top"
          titleFontSize={14}
          statFontSize={[24, 18]}
          titleColor="text2"
        />
        <Stat
          title={`Total APR:`}
          stat={!stakingInfo.isPeriodFinished ? `${numeral(totalApr).format('0a')}%` : '-'}
          titlePosition="top"
          titleFontSize={14}
          statFontSize={[24, 18]}
          titleColor="text2"
        />
        <Hidden upToSmall={true}>
          <CloseIcon onClick={onClose} color={theme.text3} />
        </Hidden>
      </StatsWrapper>
    </HeaderRoot>
  );
};

export default Header;
