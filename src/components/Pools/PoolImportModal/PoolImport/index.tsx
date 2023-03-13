import { Currency, JSBI, TokenAmount } from '@pangolindex/sdk';
import React, { useContext, useEffect } from 'react';
import { ChevronDown, Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, CurrencyLogo, Text } from 'src/components';
import { PairState, usePair } from 'src/data/Reserves';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { usePairAdder } from 'src/state/puser/hooks';
import { usePairBalanceHook } from 'src/state/pwallet/hooks';
import PositionCard from '../PositionCard';
import { ArrowWrapper, CurrencySelectWrapper, Dots, LightCard, PoolImportWrapper } from './styleds';

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

interface ClaimProps {
  onClose: () => void;
  currency0?: Currency;
  currency1?: Currency;
  openTokenDrawer: () => void;
  setActiveField: (params: Fields) => void;
  onManagePoolsClick: () => void;
}

const PoolImport = ({ currency0, currency1, openTokenDrawer, setActiveField, onManagePoolsClick }: ClaimProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const usePairBalance = usePairBalanceHook[chainId];

  const [pairState, pair] = usePair(currency0 ?? undefined, currency1 ?? undefined);
  const addPair = usePairAdder();
  useEffect(() => {
    if (pair) {
      addPair(pair);
    }
  }, [pair, addPair]);

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0)),
    );

  const position: TokenAmount | undefined = usePairBalance(account ?? undefined, pair ?? undefined);
  const hasPosition = Boolean(position && JSBI.greaterThan(position.raw, JSBI.BigInt(0)));

  const prerequisiteMessage = (
    <LightCard>
      <Text textAlign="center" color="color6" fontSize={14}>
        {!account ? t('poolFinder.connectToFind') : t('poolFinder.selectTokenToFind')}
      </Text>
    </LightCard>
  );

  function getCard() {
    if (pairState === PairState.EXISTS) {
      if (hasPosition && pair) {
        return <PositionCard pair={pair} onManagePoolsClick={onManagePoolsClick} />;
      }
      return (
        <LightCard>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Text color="color6" fontSize={14} textAlign="center">
              {t('poolFinder.noLiquidityYet')}
            </Text>
            {/* <Text color="primary" fontSize={14} textAlign="center" onClick={() => {}} cursor="pointer">
              {t('poolFinder.addLiquidity')}
            </Text> */}
          </Box>
        </LightCard>
      );
    }
    if (validPairNoLiquidity) {
      return (
        <LightCard>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Text color="color6" fontSize={14} textAlign="center">
              {t('poolFinder.noPoolFound')}
            </Text>
            {/* <Text color="primary" fontSize={14} textAlign="center" onClick={() => {}} cursor="pointer">
            {t('poolFinder.createPool')}
          </Text> */}
          </Box>
        </LightCard>
      );
    }
    if (pairState === PairState.INVALID) {
      return (
        <LightCard>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Text color="color6" fontSize={14} textAlign="center" fontWeight={500}>
              {t('poolFinder.invalidPair')}
            </Text>
          </Box>
        </LightCard>
      );
    }
    if (pairState === PairState.LOADING) {
      return (
        <LightCard>
          <Box textAlign="center">
            <Text textAlign="center" color="white">
              {t('poolFinder.loading')}
              <Dots />
            </Text>
          </Box>
        </LightCard>
      );
    }
    return null;
  }

  return (
    <PoolImportWrapper>
      <CurrencySelectWrapper
        onClick={() => {
          openTokenDrawer();
          setActiveField(Fields.TOKEN0);
        }}
      >
        <Box display="flex" alignItems="center">
          <CurrencyLogo size={24} currency={currency0} imageSize={48} />
          <Text color="text2" fontSize={16} fontWeight={500} lineHeight="40px" marginLeft={10}>
            {currency0?.symbol}
          </Text>
        </Box>
        <ChevronDown size="16" color={theme.text1} />
      </CurrencySelectWrapper>

      <Box width="100%" textAlign="center" alignItems="center" display="flex" justifyContent={'center'} mt={10} mb={10}>
        <ArrowWrapper>
          <Plus size="16" color={theme.text1} />
        </ArrowWrapper>
      </Box>

      <CurrencySelectWrapper
        onClick={() => {
          openTokenDrawer();
          setActiveField(Fields.TOKEN1);
        }}
      >
        {currency1 ? (
          <Box display="flex" alignItems="center">
            <CurrencyLogo size={24} currency={currency1} imageSize={48} />
            <Text color="text2" fontSize={16} fontWeight={500} lineHeight="40px" marginLeft={10}>
              {currency1?.symbol}
            </Text>
          </Box>
        ) : (
          <Text color="text1" fontSize={16} fontWeight={500} padding="8px 0px">
            {t('searchModal.selectToken')}
          </Text>
        )}

        <ChevronDown size="16" color={theme.text1} />
      </CurrencySelectWrapper>
      <Box paddingX="10px" paddingY="20px" bgColor="color3" mt="10px" borderRadius="8px">
        <Text color="text1" fontSize={14} textAlign="center">
          {t('pool.importDescription1')}
        </Text>
        <Text color="text1" fontSize={14} marginTop="10px" textAlign="center">
          {t('pool.importDescription2')}
        </Text>
      </Box>
      {currency0 && currency1 ? getCard() : prerequisiteMessage}
    </PoolImportWrapper>
  );
};
export default PoolImport;
