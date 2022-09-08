import { CHAINS, Currency, CurrencyAmount, Percent, Price } from '@pangolindex/sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stat } from 'src/components';
import { ONE_BIPS } from 'src/constants';
import { useChainId } from 'src/hooks';
import { useUSDCPriceHook } from 'src/hooks/multiChainsHooks';
import { Field } from 'src/state/pmint/actions';
import { GridContainer, Root } from './styled';

interface BarProps {
  currencies: { [field in Field]?: Currency };
  noLiquidity?: boolean;
  poolTokenPercentage?: Percent;
  price?: Price;
  parsedAmounts: { [field in Field]?: CurrencyAmount };
}

const PoolPriceBar = ({ currencies, noLiquidity, poolTokenPercentage, price, parsedAmounts }: BarProps) => {
  const { t } = useTranslation();
  const currency0InputValue = parsedAmounts[Field.CURRENCY_A]?.toSignificant(6);
  const chainId = useChainId();

  const currency0 = currencies[Field.CURRENCY_A];
  const useUSDCPrice = useUSDCPriceHook[chainId];

  const currency0PriceTmp = useUSDCPrice(currency0);

  const currency0Price = CHAINS[chainId]?.mainnet ? currency0PriceTmp : undefined;

  const multipyAmount = currency0Price ? Number(currency0Price.toFixed()) * 2 * Number(currency0InputValue) : 0;

  const sharePoolStat = multipyAmount ? `$${multipyAmount?.toFixed(4)}` : '-';

  function getShareOfPool() {
    if (noLiquidity && price) {
      return '100%';
    } else if (poolTokenPercentage?.lessThan(ONE_BIPS)) {
      return '<0.01%';
    } else {
      return `${poolTokenPercentage?.toFixed(2) ?? 0}%`;
    }
  }

  return (
    <Root>
      <GridContainer>
        <Box>
          <Stat
            title={`${t('migratePage.usd')}`}
            stat={sharePoolStat}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={14}
            titleColor="text2"
          />
        </Box>

        <Box>
          <Stat
            title={`${t('addLiquidity.shareOfPool')}`}
            stat={getShareOfPool()}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={14}
            titleColor="text2"
          />
        </Box>
      </GridContainer>
    </Root>
  );
};
export default PoolPriceBar;
