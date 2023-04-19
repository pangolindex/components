/* eslint-disable max-lines */
import { Currency, CurrencyAmount, Position } from '@pangolindex/sdk';
import React, { useContext } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, DoubleCurrencyLogo, Loader, Stat, Text, TransactionCompleted } from 'src/components';
import Drawer from 'src/components/Drawer';
import { useChainId } from 'src/hooks';
import { Bound, Field } from 'src/state/pmint/concentratedLiquidity/atom';
import { formatTickPrice } from 'src/utils';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import { ErrorBox, ErrorWrapper, Footer, Header, Root, StateContainer } from './styled';

interface Props {
  isOpen: boolean;
  attemptingTxn: boolean;
  txHash: string | undefined;
  poolErrorMessage: string | undefined;
  onClose: () => void;
  noLiquidity?: boolean;
  currencies: { [field in Field]?: Currency };
  parsedAmounts: { [field in Field]?: CurrencyAmount };
  onAdd: () => void;
  position: Position | undefined;
  ticksAtLimit: { [bound: string]: boolean | undefined };
}

const ConfirmDrawer: React.FC<Props> = (props) => {
  const {
    isOpen,
    onClose,
    attemptingTxn,
    poolErrorMessage,
    txHash,
    noLiquidity,
    currencies,
    parsedAmounts,
    onAdd,
    position,
    ticksAtLimit,
  } = props;

  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const chainId = useChainId();
  position?.pool?.token0;
  const currency0 = position?.pool?.token0 ? unwrappedToken(position?.pool?.token0, chainId) : undefined;
  const currency1 = position?.pool?.token1 ? unwrappedToken(position?.pool?.token1, chainId) : undefined;

  const baseCurrencyDefault = currencies[Field.CURRENCY_A];

  const baseCurrency = baseCurrencyDefault
    ? baseCurrencyDefault === currency0
      ? currency0
      : baseCurrencyDefault === currency1
      ? currency1
      : currency0
    : currency0;

  const sorted = baseCurrency === currency0;
  const quoteCurrency = sorted ? currency1 : currency0;

  const price = sorted ? position?.pool.priceOf(position?.pool?.token0) : position?.pool.priceOf(position?.pool.token1);

  const priceLower = sorted ? position?.token0PriceLower : position?.token0PriceUpper.invert();
  const priceUpper = sorted ? position?.token0PriceUpper : position?.token0PriceLower.invert();

  const pendingText = `${t('pool.supplying')} ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencies[Field.CURRENCY_A]?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`;

  function renderDetailConfirmContentButton() {
    return (
      <Button variant="primary" onClick={onAdd}>
        {noLiquidity ? t('addLiquidity.createPoolSupply') : t('addLiquidity.confirmSupply')}
      </Button>
    );
  }

  const DetailConfirmContent = (
    <Root>
      <Header>
        <Box display="flex">
          <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />

          <Text fontSize={['26px', '22px']} fontWeight={500} lineHeight="42px" marginLeft={10} color="text1">
            {currency0?.symbol + '/' + currency1?.symbol}
          </Text>
        </Box>

        <StateContainer>
          <Stat
            title={`${currency0?.symbol ? currency0?.symbol : ''} ${t('addLiquidity.deposited')}`}
            stat={`${position?.amount0 ? position?.amount0?.toSignificant(4) : '-'}`}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[26, 20]}
            titleColor="text2"
            currency={currency0}
            statfontWeight={'600'}
          />

          <Stat
            title={`${currency1?.symbol ? currency1?.symbol : ''} ${t('addLiquidity.deposited')}`}
            stat={`${position?.amount1 ? position?.amount1?.toSignificant(4) : '-'}`}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[26, 20]}
            titleColor="text2"
            currency={currency1}
            statfontWeight={'600'}
          />
        </StateContainer>

        <StateContainer>
          <Stat
            title={`${t('concentratedLiquidity.priceRange.minPrice')} (${quoteCurrency?.symbol} / ${
              baseCurrency?.symbol
            })`}
            stat={formatTickPrice({
              price: priceLower,
              atLimit: ticksAtLimit,
              direction: Bound.LOWER,
            })}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[26, 20]}
            titleColor="text2"
            statfontWeight={'600'}
          />

          <Stat
            title={`${t('concentratedLiquidity.priceRange.maxPrice')} (${quoteCurrency?.symbol} / ${
              baseCurrency?.symbol
            })`}
            stat={formatTickPrice({
              price: priceUpper,
              atLimit: ticksAtLimit,
              direction: Bound.UPPER,
            })}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[24, 20]}
            titleColor="text2"
            statfontWeight={'600'}
          />
        </StateContainer>

        <StateContainer>
          <Stat
            title={`${t('concentratedLiquidity.priceRange.currentPrice')} (${quoteCurrency?.symbol} / ${
              baseCurrency?.symbol
            })`}
            stat={`${price ? price.toSignificant(5) : 0}`}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[24, 20]}
            titleColor="text2"
            statfontWeight={'600'}
          />

          <Stat
            title={t('concentratedLiquidity.feeTier.feeTier')}
            stat={`${(position?.pool?.fee ?? 0) / 10000}%`}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[24, 20]}
            titleColor="text2"
            statfontWeight={'600'}
          />
        </StateContainer>
      </Header>
      <Footer>
        <Box my={'10px'}>{renderDetailConfirmContentButton()}</Box>
      </Footer>
    </Root>
  );

  const PendingContent = <Loader size={100} label={pendingText} />;

  const ErrorContent = (
    <ErrorWrapper>
      <ErrorBox>
        <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
        <Text fontWeight={500} fontSize={[16, 14]} color={'red1'} style={{ textAlign: 'center', width: '85%' }}>
          {poolErrorMessage}
        </Text>
      </ErrorBox>
      <Button variant="primary" onClick={onClose}>
        {t('transactionConfirmation.dismiss')}
      </Button>
    </ErrorWrapper>
  );

  const SubmittedContent = (
    <Box padding="10px" height="100%">
      <TransactionCompleted
        submitText={t('pool.liquidityAdded')}
        isShowButtton={true}
        onButtonClick={() => {
          onClose();
        }}
        buttonText={t('transactionConfirmation.close')}
      />
    </Box>
  );

  const renderBody = () => {
    if (txHash) {
      return SubmittedContent;
    }

    if (attemptingTxn) {
      return PendingContent;
    }

    if (poolErrorMessage) {
      return ErrorContent;
    }

    return DetailConfirmContent;
  };

  function getTitle() {
    if (txHash) {
      return undefined;
    }

    return t('sarStake.summary');
  }

  return (
    <Drawer
      title={getTitle()}
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      backgroundColor={'bg2'}
    >
      {renderBody()}
    </Drawer>
  );
};
export default ConfirmDrawer;
/* eslint-enable max-lines */
