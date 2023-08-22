import { Currency } from '@pangolindex/sdk';
import React from 'react';
import { Text } from '@pangolindex/core';
import RemoveLiquidity from '../RemoveLiquidity';
import { Wrapper } from './styleds';
import { useTranslation } from '@pangolindex/shared';
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
