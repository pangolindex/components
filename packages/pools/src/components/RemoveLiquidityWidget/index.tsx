import { Text } from '@honeycomb-finance/core';
import { useTranslation } from '@honeycomb-finance/shared';
import { Currency } from '@pangolindex/sdk';
import React from 'react';
import RemoveLiquidity from '../RemoveLiquidity';
import { Wrapper } from './styleds';
interface Props {
  currencyA: Currency;
  currencyB: Currency;
}

export default function RemoveLiquidityWidget({ currencyA, currencyB }: Props) {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <Text color="drawer.text" fontSize={21} fontWeight={800}>
        {t('navigationTabs.removeLiquidity')}
      </Text>
      <RemoveLiquidity currencyA={currencyA} currencyB={currencyB} />
    </Wrapper>
  );
}
