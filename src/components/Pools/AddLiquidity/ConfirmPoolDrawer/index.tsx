/* eslint-disable max-lines */
import { Currency, CurrencyAmount, Fraction, Percent, TokenAmount } from '@pangolindex/sdk';
import numeral from 'numeral';
import React, { useContext } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import {
  Box,
  Button,
  CurrencyLogo,
  DoubleCurrencyLogo,
  Loader,
  Stat,
  Text,
  TransactionCompleted,
} from 'src/components';
import Drawer from 'src/components/Drawer';
import { Field } from 'src/state/pmint/atom';
import { SpaceType } from 'src/state/pstake/types';
import { useHederaPGLAssociated } from 'src/state/pwallet/hooks/hedera';
import { Hidden } from 'src/theme/components';
import { ErrorBox, ErrorWrapper, Footer, Header, OutputText, Root, StatWrapper } from './styled';

interface Props {
  isOpen: boolean;
  attemptingTxn: boolean;
  txHash: string | undefined;
  allowedSlippage: number;
  liquidityMinted?: TokenAmount;
  poolErrorMessage: string | undefined;
  onClose: () => void;
  onComplete?: () => void;
  noLiquidity?: boolean;
  price?: Fraction;
  currencies: { [field in Field]?: Currency };
  parsedAmounts: { [field in Field]?: CurrencyAmount };
  poolTokenPercentage?: Percent;
  onAdd: () => void;
  onAddToFarm?: () => void;
  type: SpaceType.card | SpaceType.detail;
}

const ConfirmSwapDrawer: React.FC<Props> = (props) => {
  const {
    isOpen,
    onClose,
    allowedSlippage,
    attemptingTxn,
    liquidityMinted,
    poolErrorMessage,
    txHash,
    noLiquidity,
    price,
    currencies,
    parsedAmounts,
    poolTokenPercentage,
    onAdd,
    onComplete = () => {
      /**/
    },
    onAddToFarm,
    type,
  } = props;

  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const inputCurrency = currencies[Field.CURRENCY_A];
  const outputCurrency = currencies[Field.CURRENCY_B];

  const {
    associate: onAssociate,
    isLoading: isLoadingAssociate,
    hederaAssociated: isHederaTokenAssociated,
  } = useHederaPGLAssociated(inputCurrency, outputCurrency);

  const pendingText = `${t('pool.supplying')} ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencies[Field.CURRENCY_A]?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`;

  function renderAssociatButton() {
    return (
      <Button variant="primary" isDisabled={Boolean(isLoadingAssociate)} onClick={onAssociate}>
        {isLoadingAssociate ? `${t('pool.associating')}` : `${t('pool.associate')} PGL`}
      </Button>
    );
  }

  function renderDetailConfirmContentButton() {
    if (isHederaTokenAssociated) {
      return (
        <Button variant="primary" onClick={onAdd}>
          {noLiquidity ? t('addLiquidity.createPoolSupply') : t('addLiquidity.confirmSupply')}
        </Button>
      );
    }

    return renderAssociatButton();
  }

  function renderCardConfirmContentButton() {
    if (isHederaTokenAssociated) {
      return (
        <Button variant="primary" onClick={onAdd} height="46px">
          {noLiquidity ? t('addLiquidity.createPoolSupply') : t('addLiquidity.confirmSupply')}
        </Button>
      );
    }

    return renderAssociatButton();
  }

  const DetailConfirmContent = (
    <Root>
      <Header>
        {noLiquidity ? (
          <Box display="flex">
            <Text fontSize={['26px', '22px']} fontWeight={500} lineHeight="42px" marginRight={10} color="text1">
              {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol}
            </Text>
            <DoubleCurrencyLogo
              currency0={currencies[Field.CURRENCY_A]}
              currency1={currencies[Field.CURRENCY_B]}
              size={24}
            />
          </Box>
        ) : (
          <Box>
            <Box display="flex">
              <Text fontSize={['26px', '22px']} fontWeight={500} lineHeight="42px" marginRight={10} color="text1">
                {liquidityMinted?.toSignificant(6)}
              </Text>
              <DoubleCurrencyLogo
                currency0={currencies[Field.CURRENCY_A]}
                currency1={currencies[Field.CURRENCY_B]}
                size={24}
              />
            </Box>

            <Box>
              <Text fontSize={['20px', '16px']} color="text1" lineHeight="40px">
                {currencies[Field.CURRENCY_A]?.symbol +
                  '/' +
                  currencies[Field.CURRENCY_B]?.symbol +
                  t('addLiquidity.poolTokens')}
              </Text>
            </Box>
            <OutputText>{t('addLiquidity.outputEstimated', { allowedSlippage: allowedSlippage / 100 })}</OutputText>
          </Box>
        )}
        <Box mt={20}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Text fontSize="12px" color="text1">
              {currencies[Field.CURRENCY_A]?.symbol} {t('addLiquidity.deposited')}
            </Text>
            <Box display="flex">
              <CurrencyLogo currency={currencies[Field.CURRENCY_A]} size={24} />
              <Text fontSize="14px" color="text1" ml="10px">
                {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
              </Text>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt="5px">
            <Text fontSize="12px" color="text1">
              {currencies[Field.CURRENCY_B]?.symbol} {t('addLiquidity.deposited')}
            </Text>
            <Box display="flex">
              <CurrencyLogo currency={currencies[Field.CURRENCY_B]} size={24} />
              <Text fontSize="14px" color="text1" ml="10px">
                {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
              </Text>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt="5px">
            <Text fontSize="12px" color="text1">
              {t('addLiquidity.rates')}
            </Text>
            <Box>
              <Text fontSize="14px" color="text1" ml="10px">
                {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
                  currencies[Field.CURRENCY_B]?.symbol
                }`}
              </Text>

              <Text fontSize="14px" color="text1" ml="10px">
                {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
                  currencies[Field.CURRENCY_A]?.symbol
                }`}
              </Text>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt="5px">
            <Text fontSize="12px" color="text1">
              {t('addLiquidity.shareOfPool')}
            </Text>

            <Text fontSize="14px" color="text1" ml="10px">
              {noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%
            </Text>
          </Box>
        </Box>
      </Header>
      <Footer>
        <Box my={'10px'}>{renderDetailConfirmContentButton()}</Box>
      </Footer>
    </Root>
  );

  const CardConfirmContent = (
    <Box display="flex" flexDirection="column" px={20} pb={20} height="100%">
      <Box flex={1}>
        <StatWrapper>
          <Hidden upToSmall={true} display="inline-block">
            <Text color={'text1'} fontSize={[16, 14]}>
              {t('addLiquidity.deposited')}
            </Text>

            <Box display="flex" alignItems="center">
              <Text color={'text1'} fontSize={[20, 16]}>
                {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} {currencies[Field.CURRENCY_A]?.symbol}
              </Text>
            </Box>

            <Box display="flex" alignItems="center">
              <Text color={'text1'} fontSize={[20, 16]}>
                {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} {currencies[Field.CURRENCY_B]?.symbol}
              </Text>
            </Box>
          </Hidden>

          <Stat
            title={`PGL`}
            stat={noLiquidity ? '-' : `${numeral(liquidityMinted?.toFixed()).format('0.00a')}`}
            titlePosition="top"
            titleFontSize={14}
            statFontSize={[16, 20]}
            toolTipText={`pgl: ${liquidityMinted?.toSignificant(6)}`}
          />

          <Stat
            title={t('addLiquidity.shareOfPool')}
            stat={`${noLiquidity ? '100' : poolTokenPercentage?.toFixed(6)}%`}
            titlePosition="top"
            titleFontSize={14}
            statFontSize={[16, 20]}
            toolTipText={`${noLiquidity ? '100' : poolTokenPercentage?.toFixed(12)}%`}
          />
        </StatWrapper>
        <Box mt={10}>
          <OutputText fontSize={12} fontWeight={400}>
            {t('addLiquidity.outputEstimated', { allowedSlippage: allowedSlippage / 100 })}
          </OutputText>
        </Box>
      </Box>
      <Box mt={'10px'}>{renderCardConfirmContentButton()}</Box>
    </Box>
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
        isShowButtton={Boolean((type === SpaceType.card && onAddToFarm) || type === SpaceType.detail)}
        onButtonClick={() => {
          onClose();
          if (onAddToFarm) {
            onAddToFarm();
          } else {
            onComplete();
          }
        }}
        buttonText={onAddToFarm ? t('transactionConfirmation.addToFarm') : t('transactionConfirmation.close')}
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

    if (type === SpaceType.detail) {
      return DetailConfirmContent;
    }

    return CardConfirmContent;
  };

  function getTitle() {
    if (noLiquidity) {
      return t('addLiquidity.creatingPool');
    }

    if (txHash) {
      return undefined;
    }

    return t('addLiquidity.willReceive');
  }

  return (
    <Drawer
      title={getTitle()}
      isOpen={isOpen}
      onClose={() => {
        type === SpaceType.card ? onComplete() : onClose();
      }}
      backgroundColor={type === SpaceType.card ? 'color5' : 'bg2'}
    >
      {renderBody()}
    </Drawer>
  );
};
export default ConfirmSwapDrawer;
/* eslint-enable max-lines */
