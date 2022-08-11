import { formatEther } from '@ethersproject/units';
import numeral from 'numeral';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import CurrencyLogo from 'src/components/CurrencyLogo';
import { Stat } from 'src/components/Stat';
import { Text } from 'src/components/Text';
import { TextInput } from 'src/components/TextInput';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { Position, useDerivativeSarUnstake } from 'src/state/psarstake/hooks';
import ConfirmDrawer from '../ConfirmDrawer';
import { Footer, Header, TokenRow } from '../ConfirmDrawer/styled';
import Title from '../Title';
import { Wrapper } from '../styleds';
import { Options } from '../types';
import { Root } from './styleds';

interface Props {
  selectedOption: Options;
  selectedPosition: Position | null;
  onChange: (value: Options) => void;
}

export default function Unstake({ selectedOption, selectedPosition, onChange }: Props) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const png = PNG[chainId];

  const stakedAmount = selectedPosition?.balance ?? 0;

  const { t } = useTranslation();

  const {
    attempting,
    hash,
    typedValue,
    parsedAmount,
    error,
    unstakeError,
    onUserInput,
    wrappedOnDismiss,
    handleMax,
    onUnstake,
  } = useDerivativeSarUnstake(selectedPosition);

  const toggleWalletModal = useWalletModalToggle();

  const handleConfirmDismiss = useCallback(() => {
    setOpenDrawer(false);
    // if there was a tx hash, we want to clear the input
    if (hash) {
      onUserInput('');
    }
    wrappedOnDismiss();
  }, [onUserInput]);

  const renderButton = () => {
    if (!account) {
      return (
        <Button padding="15px 18px" variant="primary" onClick={toggleWalletModal}>
          {t('removeLiquidity.connectWallet')}
        </Button>
      );
    } else {
      return (
        <Button
          variant={'primary'}
          isDisabled={!selectedPosition || !!error}
          onClick={() => setOpenDrawer(true)}
          height="46px"
        >
          {!selectedPosition ? t('sarStakeMore.choosePosition') : error ?? t('sarUnstake.unstake')}
        </Button>
      );
    }
  };

  const ConfirmContent = (
    <Wrapper paddingX="20px" paddingBottom="20px">
      <Header>
        <TokenRow>
          <Text fontSize={24} fontWeight={500} color="text1" style={{ marginRight: '12px' }}>
            {t('sarUnstake.unstaking', { balance: parsedAmount?.toSignificant(6) ?? 0 })}
          </Text>
          <CurrencyLogo currency={png} size={24} imageSize={48} />
        </TokenRow>
        <Box display="inline-grid" style={{ gridGap: '10px', gridTemplateColumns: 'auto auto' }}>
          <Stat
            title={t('sarUnstake.currentAPR')}
            titlePosition="top"
            stat={`${(selectedPosition?.apr ?? '-').toString()}%`}
            titleColor="text2"
          />
          <Stat title={t('sarStakeMore.newAPR')} titlePosition="top" stat={'0%'} titleColor="text2" />
        </Box>
        <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
          {t('sarUnstake.confirmDescription')}
        </Text>
      </Header>
      <Footer>
        <Box my={'10px'}>
          <Button variant="primary" onClick={onUnstake}>
            {t('sarUnstake.unstake')}
          </Button>
        </Box>
      </Footer>
    </Wrapper>
  );

  return (
    <Box>
      <Root>
        <Title selectPosition={selectedPosition} selectedOption={selectedOption} onChange={onChange} />
        <Box>
          <Box justifyContent="space-between" display="flex">
            <Text color="text1" fontSize="18px" fontWeight={500}>
              {t('sarUnstake.unstake')}
            </Text>
            <Text color="text4">
              {t('sarUnstake.stakedBalance', {
                symbol: png.symbol,
                balance: numeral(formatEther(stakedAmount)).format('0.00a'),
              })}
            </Text>
          </Box>
          <TextInput
            value={typedValue}
            isNumeric={true}
            placeholder="0.00"
            addonAfter={
              <Button variant="plain" backgroundColor="color2" padding="6px" height="auto" onClick={handleMax}>
                <Text color="text1">{t('sarStake.max')}</Text>
              </Button>
            }
            onChange={(value: any) => {
              onUserInput(value);
            }}
          />
        </Box>
        <Box display="grid" bgColor="color3" borderRadius="4px" padding="20px" style={{ gridGap: '20px' }}>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Text color="text2">{t('sarUnstake.currentAPR')}</Text>
              <Text color="text1">{(selectedPosition?.apr ?? '-').toString()}%</Text>
            </Box>
            <Box>
              <Text color="text2">{t('sarUnstake.aprAfter')}</Text>
              <Text color="text1">0%</Text>
            </Box>
          </Box>
          <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
            {t('sarUnstake.unstakeWarning')}
          </Text>
        </Box>
        {renderButton()}
      </Root>

      <ConfirmDrawer
        title={unstakeError || hash || attempting ? '' : t('sarStake.summary')}
        isOpen={openDrawer && !!selectedPosition}
        onClose={handleConfirmDismiss}
        attemptingTxn={attempting}
        txHash={hash}
        errorMessage={unstakeError}
        pendingMessage={t('sarUnstake.pending', { balance: parsedAmount?.toSignificant(2) ?? 0, symbol: png.symbol })}
        successMessage={t('sarUnstake.successSubmit')}
        confirmContent={ConfirmContent}
      />
    </Box>
  );
}
