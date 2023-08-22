import { Box, CurrencyLogo, DoubleCurrencyLogo, Text } from '@pangolindex/core';
import { ChainId, Token } from '@pangolindex/sdk';
import React from 'react';
import { HelpCircle } from 'react-feather';
import { PairDataUser, TokenDataUser } from 'src/hooks';
import { RowWrapper, StyledLogo, Wrapper } from './styleds';

type Props = {
  coin?: TokenDataUser;
  pair?: PairDataUser;
  showBalances: boolean;
};

const PortfolioRow: React.FC<Props> = ({ coin, pair, showBalances }) => {
  const renderLogo = (size) => {
    if (coin) {
      if ((coin.token instanceof Token && coin.token.chainId == ChainId.AVALANCHE) || !(coin.token instanceof Token)) {
        return <CurrencyLogo size={size} currency={coin.token} />;
      } else if (coin?.logo) {
        return <StyledLogo srcs={[coin.logo]} size={`${size}px`} />;
      }
    }

    if (pair) {
      if (pair?.pair?.chainId == ChainId.AVALANCHE) {
        return <DoubleCurrencyLogo currency0={pair?.pair?.token0} currency1={pair?.pair?.token1} size={24} />;
      } else if (pair.logos) {
        return (
          <Wrapper margin={false} sizeraw={size}>
            <StyledLogo srcs={[pair.logos[0]]} size={`${size}px`} style={{ zIndex: 2 }} />
            <StyledLogo
              srcs={[pair.logos[1]]}
              size={`${size}px`}
              style={{ position: 'absolute', left: '-' + (size / 2).toString() + 'px' }}
            />
          </Wrapper>
        );
      }
    }

    return <HelpCircle size={size} />;
  };

  const amount = coin && !pair ? coin.price * coin.amount : pair && !coin ? pair.usdValue : 0;

  return (
    <RowWrapper>
      <Box display="flex" alignItems="center">
        {renderLogo(24)}
        {coin && (
          <Text color="text1" fontSize={14} fontWeight={500} marginLeft={'6px'}>
            {coin?.token?.symbol}
          </Text>
        )}
        {pair && (
          <Text color="text1" fontSize={14} fontWeight={500} marginLeft={'6px'}>
            {pair?.pair?.token0?.symbol} - {pair?.pair?.token1?.symbol}
          </Text>
        )}
      </Box>
      <Box textAlign="right">
        {!showBalances ? (
          <Text color="text13" fontSize={16} fontWeight={700}>
            *
          </Text>
        ) : (
          <Text color="text1" fontSize={14} fontWeight={500}>
            ${amount.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
          </Text>
        )}
      </Box>
    </RowWrapper>
  );
};

export default PortfolioRow;
