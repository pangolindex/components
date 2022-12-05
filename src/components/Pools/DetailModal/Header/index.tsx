import { CHAINS, ChefType, Price } from '@pangolindex/sdk';
import { BigNumber } from 'ethers';
import numeral from 'numeral';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, DoubleCurrencyLogo, Stat, Text } from 'src/components';
import { useChainId } from 'src/hooks';
import { usePangoChefExtraFarmApr, useUserPangoChefAPR, useUserPangoChefRewardRate } from 'src/state/ppangoChef/hooks';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { useGetFarmApr, useGetRewardTokens } from 'src/state/pstake/hooks';
import { StakingInfo } from 'src/state/pstake/types';
import { CloseIcon, Hidden, Visible } from 'src/theme/components';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import RewardTokens from '../../RewardTokens';
import { HeaderRoot, HeaderWrapper, StatsWrapper } from './styled';

type Props = {
  stakingInfo: StakingInfo;
  onClose: () => void;
};

const Header: React.FC<Props> = ({ stakingInfo, onClose }) => {
  const theme = useContext(ThemeContext);
  const chainId = useChainId();

  const { t } = useTranslation();

  const token0 = stakingInfo?.tokens[0];
  const token1 = stakingInfo?.tokens[1];

  const currency0 = unwrappedToken(token0, chainId);
  const currency1 = unwrappedToken(token1, chainId);

  const rewardTokens = useGetRewardTokens(stakingInfo?.rewardTokens, stakingInfo.rewardTokensAddress);

  const { swapFeeApr: _swapFeeApr, stakingApr: _stakingApr } = useGetFarmApr(stakingInfo?.pid as string);

  const cheftType = CHAINS[chainId].contracts?.mini_chef?.type ?? ChefType.MINI_CHEF_V2;

  // old calculation, it's using if the userRewardRate is not broken
  //userApr = userRewardRate(POOL_ID, USER_ADDRESS) * 365 days * 100 * PNG_PRICE / (getUser(POOL_ID, USER_ADDRESS).valueVariables.balance * STAKING_TOKEN_PRICE)

  const _userApr = useUserPangoChefAPR(cheftType === ChefType.PANGO_CHEF ? (stakingInfo as PangoChefInfo) : undefined);

  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'));

  const userRewardRate = useUserPangoChefRewardRate(
    cheftType === ChefType.PANGO_CHEF ? (stakingInfo as PangoChefInfo) : undefined,
  );

  const pairPrice =
    cheftType === ChefType.PANGO_CHEF ? (stakingInfo as PangoChefInfo).pairPrice : new Price(token0, token1, '1', '0'); // dummy value, this don't use tokens

  const poolBalance =
    cheftType === ChefType.PANGO_CHEF ? (stakingInfo as PangoChefInfo).valueVariables.balance : BigNumber.from(0);
  const poolRewardRate =
    cheftType === ChefType.PANGO_CHEF ? (stakingInfo as PangoChefInfo).poolRewardRate : BigNumber.from(0);

  const userBalance =
    cheftType === ChefType.PANGO_CHEF ? (stakingInfo as PangoChefInfo).userValueVariables.balance : BigNumber.from(0);

  const extraFarmAPR = usePangoChefExtraFarmApr(
    rewardTokens,
    poolRewardRate,
    stakingInfo.rewardTokensMultiplier,
    poolBalance,
    pairPrice,
  );
  const extraUserAPR = usePangoChefExtraFarmApr(
    rewardTokens,
    userRewardRate,
    stakingInfo.rewardTokensMultiplier,
    userBalance,
    pairPrice,
  );

  const getAPRs = () => {
    if (cheftType === ChefType.MINI_CHEF_V2) {
      // for minichef v2 we get the data from redux
      return {
        totalApr: _stakingApr + _swapFeeApr,
        stakingApr: _stakingApr,
        swapFeeApr: _swapFeeApr,
        extraFarmApr: 0,
        userApr: _stakingApr + _swapFeeApr,
      };
    }

    const stakingAPR = stakingInfo.stakingApr || 0;
    const swapFeeAPR = stakingInfo.swapFeeApr || 0;
    // for rest we get the data from contract calls if exist, else put 0 for this data
    if (cheftType === ChefType.PANGO_CHEF) {
      return {
        totalApr: stakingAPR + swapFeeAPR + extraFarmAPR,
        stakingApr: stakingAPR + extraFarmAPR,
        swapFeeApr: swapFeeAPR,
        extraFarmApr: extraFarmAPR,
        userApr: Number(_userApr) + extraUserAPR,
      };
    }
    return {
      totalApr: stakingAPR + swapFeeAPR,
      stakingApr: stakingAPR,
      swapFeeApr: swapFeeAPR,
      extraFarmApr: 0,
      userApr: stakingAPR + swapFeeAPR,
    };
  };

  const { totalApr, stakingApr, swapFeeApr, userApr } = getAPRs();

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
        {cheftType === ChefType.PANGO_CHEF && isStaking && (
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
