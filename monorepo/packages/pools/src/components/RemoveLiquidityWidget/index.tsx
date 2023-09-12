import { Text } from '@honeycomb/core';
import { Currency } from '@pangolindex/sdk';
import { useTranslation } from '@honeycomb/shared';
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
