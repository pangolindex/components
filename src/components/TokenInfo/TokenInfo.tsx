import { TokenAmount } from '@pangolindex/sdk';
import numeral from 'numeral';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { CurrencyLogo, Text, Tooltip } from 'src/components';
import { useTotalSupplyHook } from 'src/data/multiChainsHooks';
import { usePangolinWeb3 } from 'src/hooks';
import { useUSDCPriceHook } from 'src/hooks/multiChainsHooks';
import { useTokenBalanceHook } from 'src/state/pwallet/multiChainsHooks';
import { StyledLogo } from '../CurrencyLogo/styles';
import { TextInfo } from './TextInfo';
import { Container, Frame, Wrapper } from './styled';
import { TokenInfoProps } from './types';

export default function TokenInfo({
  token,
  logo,
  unclaimedAmount,
  circulationSupply,
  totalSupply,
  animatedLogo,
}: TokenInfoProps) {
  const { account } = usePangolinWeb3();
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const chainId = token.chainId;

  const useTokenBalance = useTokenBalanceHook[chainId];
  const useUSDCPrice = useUSDCPriceHook[chainId];
  const useTotalSupply = useTotalSupplyHook[chainId];

  const balance = useTokenBalance(account ?? undefined, token);

  const tokenPrice = useUSDCPrice(token);

  const chainTotalSuppply = useTotalSupply(token);

  const _totalSupply = totalSupply ?? chainTotalSuppply;

  const totalAccountBalance = balance && unclaimedAmount ? balance?.add(unclaimedAmount) : new TokenAmount(token, '0');

  return (
    <Wrapper>
      <Text color="text1" lineHeight="20px" fontWeight={500}>
        {t('header.pngBreakDown', { symbol: token?.symbol })}
      </Text>
      <Frame>
        <Container>
          {logo ? (
            <StyledLogo
              size="48px"
              srcs={[logo]}
              alt={`${token.symbol} Logo`}
              className={animatedLogo ? 'Animated' : undefined}
            />
          ) : (
            <CurrencyLogo currency={token} size={48} className={animatedLogo ? 'Animated' : undefined} />
          )}
        </Container>
        {account && (
          <Text color="text1" fontSize={32} fontWeight={600} data-tip data-for="totalAccountBalance-tip">
            {`${numeral(totalAccountBalance?.toFixed(2) ?? '0').format('0.00a')}`}
          </Text>
        )}
        <Tooltip id="totalAccountBalance-tip" effect="solid" backgroundColor={theme.primary}>
          <Text color="text6" fontSize="12px" fontWeight={500} textAlign="center">
            {totalAccountBalance.toFixed(token.decimals)} {token?.symbol}
          </Text>
        </Tooltip>
      </Frame>
      <Frame>
        {account && (
          <TextInfo
            text={t('header.balance')}
            value={`${numeral(balance?.toFixed(2) ?? '0').format('0.00a')}`}
            tooltipText={balance?.toFixed(token.decimals) ?? '0.00'}
          />
        )}
        {unclaimedAmount && <TextInfo text={t('header.unclaimed')} value={unclaimedAmount.toFixed(2)} />}
      </Frame>
      <Frame>
        <TextInfo
          text={t('header.tokenPrice', { symbol: token?.symbol })}
          value={`$ ${numeral(tokenPrice?.toFixed(2) ?? '0').format('0.00a')}`}
        />
        {circulationSupply && (
          <TextInfo
            text={t('header.pngCirculation', { symbol: token?.symbol })}
            value={`${numeral(circulationSupply.toFixed(2) ?? '0').format('0.00a')}`}
          />
        )}
        <TextInfo
          text={t('header.totalSupply')}
          value={`${numeral(_totalSupply?.toFixed(2) ?? '0').format('0.00a')}`}
        />
      </Frame>
    </Wrapper>
  );
}
