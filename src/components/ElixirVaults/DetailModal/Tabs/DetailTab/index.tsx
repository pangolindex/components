import { ALL_CHAINS, Chain, Token } from '@pangolindex/sdk';
import deepEqual from 'deep-equal';
import numeral from 'numeral';
import React, { useEffect } from 'react';
import ReactHtmlParser from 'react-html-parser';
import { useTranslation } from 'react-i18next';
import { Box, CoinDescription, Stat, Text } from 'src/components';
import { useChainId } from 'src/hooks';
import { convertCoingeckoTokens } from 'src/state/pcoingecko/hooks';
import { useDerivedElixirVaultInfo, useVaultActionHandlers } from 'src/state/pelixirVaults/hooks';
import { ExternalLink } from 'src/theme';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import { Information, StateContainer, Wrapper } from './styles';
import { DetailTabProps } from './types';
// import { useUSDCPriceHook } from 'src/hooks/useUSDCPrice';

const DetailTab: React.FC<DetailTabProps> = (props) => {
  const { vault } = props;
  const { t } = useTranslation();
  const chainId = useChainId();
  const relatedChain: Chain = ALL_CHAINS.find((x) => x.chain_id === chainId) as Chain;
  const { getVaultDetails } = useVaultActionHandlers();
  const { selectedVaultDetails } = useDerivedElixirVaultInfo();

  const currency0 = vault?.poolTokens?.[0] ? unwrappedToken(vault?.poolTokens?.[0], chainId) : undefined;
  const currency1 = vault?.poolTokens?.[1] ? unwrappedToken(vault?.poolTokens?.[1], chainId) : undefined;

  const calculateTotalStakeValue = (): string => {
    if (!selectedVaultDetails) return '-';
    else {
      const { underlyingToken0, underlyingToken0Price, underlyingToken1, underlyingToken1Price } = selectedVaultDetails;
      if (!underlyingToken0 || !underlyingToken1 || !underlyingToken0Price || !underlyingToken1Price) return '-';
      const totalStakeValue = (
        parseFloat(underlyingToken0) * parseFloat(underlyingToken0Price) +
        parseFloat(underlyingToken1) * parseFloat(underlyingToken1Price)
      ).toFixed(2);
      return totalStakeValue;
    }
  };

  const totalData = [
    {
      title: 'Total Stake',
      stat: selectedVaultDetails ? `${numeral(calculateTotalStakeValue()).format('$0.00a')}` : '-',
    },
    {
      title: `Underlying  ${currency0?.symbol}`,
      stat: selectedVaultDetails ? numeral(selectedVaultDetails.underlyingToken0).format('0.00a') : '-',
      currency: currency0,
    },
    {
      title: `Underlying ${currency1?.symbol}`,
      stat: selectedVaultDetails ? numeral(selectedVaultDetails.underlyingToken1).format('0.00a') : '-',
      currency: currency1,
    },
  ];

  const userData = [
    {
      title: 'Your Stake',
      stat: '-',
    },
    {
      title: `Underlying ${currency0?.symbol}`,
      stat: '-',
      currency: currency0,
    },
    {
      title: `Underlying ${currency1?.symbol}`,
      stat: '-',
      currency: currency1,
    },
  ];

  const getCoinDescriptions = () => {
    const _tokenA = !(vault?.poolTokens?.[0] instanceof Token)
      ? vault?.poolTokens?.[0]
      : convertCoingeckoTokens(vault?.poolTokens?.[0]);
    const _tokenB = !(vault?.poolTokens?.[1] instanceof Token)
      ? vault?.poolTokens?.[1]
      : convertCoingeckoTokens(vault?.poolTokens?.[1]);

    return (
      <>
        {_tokenA && (
          <Box mt={20}>
            <CoinDescription coin={_tokenA} />
          </Box>
        )}

        {_tokenB && !deepEqual(_tokenA, _tokenB) && (
          <Box mt={20}>
            <CoinDescription coin={_tokenB} />
          </Box>
        )}
      </>
    );
  };

  useEffect(() => {
    if (vault) {
      getVaultDetails({ vault: vault, chain: relatedChain }, vault?.strategyProvider?.[0]);
    }
  }, [vault]);

  return (
    <Wrapper>
      <Information>
        <Text fontSize={24} fontWeight={500} color={'text2'} mb={'20px'}>
          {t('common.totalStake')}
        </Text>
        <StateContainer colNumber={totalData.length}>
          {totalData.map((item, index) => (
            <Stat
              key={index}
              title={item.title}
              stat={item.stat}
              titlePosition="top"
              titleFontSize={14}
              titleColor="text8"
              {...(item.currency && { currency: item.currency })}
              statFontSize={[24, 18]}
            />
          ))}
        </StateContainer>
      </Information>
      <Information>
        <Text fontSize={24} fontWeight={500} color={'text2'} mb={'20px'}>
          {t('common.yourStake')}
        </Text>
        <StateContainer colNumber={userData.length}>
          {userData.map((item, index) => (
            <Stat
              key={index}
              title={item.title}
              stat={item.stat}
              titlePosition="top"
              titleFontSize={14}
              titleColor="text8"
              {...(item.currency && { currency: item.currency })}
              statFontSize={[24, 18]}
            />
          ))}
        </StateContainer>
      </Information>
      <Information>{getCoinDescriptions()}</Information>
      {vault?.strategyProvider?.[0] && (
        <Information>
          <>
            <Box>
              <Text color="text1" fontSize={16} fontWeight="bold" mb="15px">
                {vault.strategyProvider[0]?.name}
              </Text>

              <Text color="text1" fontSize={14}>
                {ReactHtmlParser(vault.strategyProvider[0]?.description?.replace('\n', '<br />') || '')}
              </Text>
              {selectedVaultDetails && (
                <Box mt="5px">
                  <ExternalLink
                    style={{ color: 'white', textDecoration: 'underline' }}
                    href={selectedVaultDetails.strategyDetailWebsite}
                    target="_blank"
                  >
                    <Text color="text1" fontSize={16} fontWeight={500}>
                      Visit Strategy Details
                    </Text>
                  </ExternalLink>
                </Box>
              )}
            </Box>
          </>
        </Information>
      )}
    </Wrapper>
  );
};

export default DetailTab;
