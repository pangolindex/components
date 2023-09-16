import { Box, Button, DoubleCurrencyLogo, Stat, Text } from '@honeycomb-finance/core';
import {
  BIG_INT_ZERO,
  ONE_BIPS,
  unwrappedToken,
  useChainId,
  usePangolinWeb3,
  useTranslation,
} from '@honeycomb-finance/shared';
import { Currency, JSBI, Pair, Percent } from '@pangolindex/sdk';
import React from 'react';
import { usePairTotalSupplyHook } from 'src/hooks/pair';
import { usePairBalanceHook } from 'src/hooks/wallet/hooks';
import { InnerWrapper, Wrapper } from './styleds';

export interface PositionCardProps {
  pair: Pair;
  onManagePoolsClick: () => void;
}

const PositionCard = ({ pair, onManagePoolsClick }: PositionCardProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const currency0 = unwrappedToken(pair?.token0, chainId);
  const currency1 = unwrappedToken(pair?.token1, chainId);

  const { t } = useTranslation();

  const usePairBalance = usePairBalanceHook[chainId];
  const usePairTotalSupply = usePairTotalSupplyHook[chainId];

  const userPoolBalance = usePairBalance(account ?? undefined, pair ?? undefined);
  const totalPoolTokens = usePairTotalSupply(pair);

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined;

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    JSBI.greaterThan(totalPoolTokens.raw, BIG_INT_ZERO) &&
    JSBI.greaterThan(userPoolBalance.raw, BIG_INT_ZERO) &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? pair.getLiquidityValues(totalPoolTokens, userPoolBalance, { feeOn: false })
      : [undefined, undefined];

  function getShareOfPool() {
    if (poolTokenPercentage?.lessThan(ONE_BIPS)) {
      return '<0.001%';
    } else {
      return `${poolTokenPercentage?.toFixed(4) ?? 0}%`;
    }
  }

  return (
    <Wrapper>
      <Text fontSize={16} color="oceanBlue">
        {t('poolFinder.poolFound')}
      </Text>

      <Box display="flex" flexDirection="column" mt={10}>
        <Text fontWeight={500} color="color6" fontSize={16}>
          {t('positionCard.yourPosition')}
        </Text>

        <Box display="flex" alignItems="center">
          <DoubleCurrencyLogo size={24} currency0={currency0 as Currency} currency1={currency1 as Currency} />

          <Box marginLeft={10}>
            <Text color="text1" fontSize={20} fontWeight={500}>
              {currency0?.symbol}/{currency1?.symbol}
            </Text>
          </Box>
        </Box>
      </Box>

      <InnerWrapper>
        <Box>
          <Stat
            title={'PGL'}
            stat={`${userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}`}
            titlePosition="top"
            titleFontSize={14}
            statFontSize={[20, 16]}
            titleColor="text2"
          />
        </Box>

        <Box>
          <Stat
            title={t('positionCard.poolShare')}
            stat={`${poolTokenPercentage ? getShareOfPool() : '-'}`}
            titlePosition="top"
            titleFontSize={14}
            statFontSize={[20, 16]}
            titleColor="text2"
          />
        </Box>
      </InnerWrapper>

      <InnerWrapper>
        <Box>
          <Stat
            title={currency0.symbol}
            stat={`${token0Deposited ? token0Deposited?.toSignificant(6) : '-'}`}
            titlePosition="top"
            titleFontSize={14}
            statFontSize={[20, 16]}
            titleColor="text2"
          />
        </Box>

        <Box>
          <Stat
            title={currency1.symbol}
            stat={`${token1Deposited ? token1Deposited?.toSignificant(6) : '-'}`}
            titlePosition="top"
            titleFontSize={14}
            statFontSize={[20, 16]}
            titleColor="text2"
          />
        </Box>
      </InnerWrapper>

      <Box mt={10}>
        <Box mr="5px" width="100%">
          <Button variant={'primary'} onClick={onManagePoolsClick}>
            {t('positionCard.manage')}
          </Button>
        </Box>
      </Box>
    </Wrapper>
  );
};
export default PositionCard;
