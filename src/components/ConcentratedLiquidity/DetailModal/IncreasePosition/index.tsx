import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';
import shuffle from 'src/assets/images/shuffle.svg';
import { Box, Button, Stat, Text, TextInput } from 'src/components';
import { usePangolinWeb3 } from 'src/hooks';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import {
  AddWrapper,
  ArrowWrapper,
  ButtonWrapper,
  GridContainer,
  InformationBar,
  InputWrapper,
  StyledBalanceMax,
} from './styles';

const IncreasePosition: React.FC = () => {
  // ------------------------------ MOCK DATA ----------------------------------
  const currency0 = new Token(ChainId.AVALANCHE, '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', 6, 'USDC', 'USD Coin');
  const currency1 = new Token(
    ChainId.AVALANCHE,
    CHAINS[ChainId.AVALANCHE].contracts!.png,
    18,
    CHAINS[ChainId.AVALANCHE].png_symbol!,
    'Pangolin',
  );
  // ---------------------------------------------------------------------------
  const { t } = useTranslation();
  const { account } = usePangolinWeb3();
  const toggleWalletModal = useWalletModalToggle();

  const renderButton = () => {
    if (!account) {
      return (
        <Button variant="primary" onClick={toggleWalletModal} height="46px">
          {t('common.connectWallet')}
        </Button>
      );
    } else {
      return (
        <ButtonWrapper>
          <Button
            height="46px"
            variant="primary"
            borderRadius="4px"
            onClick={() => {
              console.log('ADD LIQUIDITY');
            }}
          >
            {t('common.addLiquidity')}
          </Button>
        </ButtonWrapper>
      );
    }
  };

  return (
    <div>
      <Text
        color="text1"
        fontSize={[22, 18]}
        fontWeight={500}
        style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {t('concentratedLiquidity.increasePosition.title')}
      </Text>
      <AddWrapper>
        <Box flex={1}>
          <InputWrapper>
            <TextInput
              value={''}
              addonAfter={
                <Box display={'flex'} alignItems={'center'} height={'100%'} justifyContent={'center'}>
                  <StyledBalanceMax>{t('currencyInputPanel.max')}</StyledBalanceMax>
                </Box>
              }
              style={{ borderRadius: '4px' }}
              onChange={(value: any) => {
                console.log(value);
              }}
              label={`${currency0?.symbol}`}
              fontSize={16}
              labelColor={'text1'}
              isNumeric={true}
              placeholder="0.00"
              addonLabel={
                account && (
                  <Text color="text2" fontWeight={500} fontSize={12}>
                    -
                  </Text>
                )
              }
            />

            <Box width="100%" textAlign="center" alignItems="center" display={'flex'} justifyContent={'center'} mt={10}>
              <ArrowWrapper>
                <img src={shuffle} alt="shuffle" />
              </ArrowWrapper>
            </Box>

            <TextInput
              value={''}
              addonAfter={
                <Box display={'flex'} alignItems={'center'} height={'100%'} justifyContent={'center'}>
                  <StyledBalanceMax>{t('currencyInputPanel.max')}</StyledBalanceMax>
                </Box>
              }
              style={{ borderRadius: 4 }}
              onChange={(value: any) => {
                console.log(value);
              }}
              label={`${currency1?.symbol}`}
              fontSize={16}
              labelColor={'text1'}
              isNumeric={true}
              placeholder="0.00"
              addonLabel={
                account && (
                  <Text color="text2" fontWeight={500} fontSize={12}>
                    -
                  </Text>
                )
              }
            />
          </InputWrapper>
        </Box>
      </AddWrapper>
      <InformationBar>
        <GridContainer>
          <Box>
            <Stat
              title={`Dollar Worth:`}
              stat={'-'}
              titlePosition="top"
              titleFontSize={12}
              statFontSize={14}
              titleColor="text8"
            />
          </Box>

          <Box>
            <Stat
              title={`Avax Worth:`}
              stat={'-'}
              titlePosition="top"
              titleFontSize={12}
              statFontSize={14}
              titleColor="text8"
            />
          </Box>

          <Box>
            <Stat
              title={`Pool Share:`}
              stat={'-'}
              titlePosition="top"
              titleFontSize={12}
              statFontSize={14}
              titleColor="text8"
            />
          </Box>
        </GridContainer>
      </InformationBar>
      <Box width="100%">{renderButton()}</Box>
    </div>
  );
};

export default IncreasePosition;
