import { formatEther } from '@ethersproject/units';
import numeral from 'numeral';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import CurrencyLogo from 'src/components/CurrencyLogo';
import { Stat } from 'src/components/Stat';
import { Text } from 'src/components/Text';
import { TextInput } from 'src/components/TextInput';
import { ZERO_ADDRESS } from 'src/constants';
import { SAR_STAKING_ADDRESS } from 'src/constants/address';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useHederaTokenAssociated } from 'src/hooks/tokens/hedera';
import { ApprovalState } from 'src/hooks/useApproveCallback/constant';
import { useHederaFn } from 'src/hooks/useConnector';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { useDerivativeSarStakeHook } from 'src/state/psarstake/hooks';
import { useSarStakeInfo } from 'src/state/psarstake/hooks/evm';
import { Position } from 'src/state/psarstake/types';
import { useTokenBalanceHook } from 'src/state/pwallet/hooks';
import { getBuyUrl } from 'src/utils';
import { Hedera } from 'src/utils/hedera';
import ConfirmDrawer from '../ConfirmDrawer';
import { Footer, Header, TokenRow } from '../ConfirmDrawer/styled';
import Title from '../Title';
import { Options } from '../types';
import { Buttons, Root, Wrapper } from './styleds';

interface Props {
  selectedOption: Options;
  selectedPosition: Position | null;
  onChange: (value: Options) => void;
  onSelectPosition: (position: Position | null) => void;
}

// Add more png on existing position
export default function AddStake({ selectedOption, selectedPosition, onChange, onSelectPosition }: Props) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const chainId = useChainId();
  const { account } = usePangolinWeb3();

  const png = PNG[chainId];
  const useTokenBalance = useTokenBalanceHook[chainId];
  const userPngBalance = useTokenBalance(account ?? ZERO_ADDRESS, png);
  const { t } = useTranslation();

  const { apr } = useSarStakeInfo();

  const toggleWalletModal = useWalletModalToggle();

  const useDerivativeSarStake = useDerivativeSarStakeHook[chainId];

  const hederaFn = useHederaFn();

  const {
    attempting,
    typedValue,
    parsedAmount,
    hash,
    dollerWorth,
    error,
    approval,
    stakeError,
    onAttemptToApprove,
    onUserInput,
    wrappedOnDismiss,
    handleMax,
    onStake,
  } = useDerivativeSarStake(selectedPosition);

  const oldBalance = selectedPosition?.balance;
  const newBalance = oldBalance?.add((parsedAmount?.raw ?? 0).toString()).add(selectedPosition?.pendingRewards ?? 0);

  // if new balance is zero return 1, if not exist position return 1 , if exist position return new balance
  const _newBalance = newBalance?.isZero() ? 1 : newBalance ?? 1;

  const newAPR = selectedPosition?.rewardRate.mul(86400).mul(365).mul(100).div(_newBalance);

  const weeklyPNG = selectedPosition?.rewardRate.mul(86400).mul(7);

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  // if changed the position and the drawer is open, close
  useEffect(() => {
    if (openDrawer) setOpenDrawer(false);
  }, [selectedPosition]);

  const handleConfirmDismiss = useCallback(() => {
    setOpenDrawer(false);
    // if there was a tx hash, we want to clear the input
    if (hash) {
      onUserInput('');
      onSelectPosition(null);
    }
    wrappedOnDismiss();
  }, [hash, onUserInput]);

  const showApproveFlow =
    !error &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED));

  const isHedera = Hedera.isHederaChain(chainId);

  const nftTokenAddress = useMemo(() => {
    const sarContractAddress = SAR_STAKING_ADDRESS[chainId];

    if (sarContractAddress && isHedera) {
      const sarContractId = hederaFn.hederaId(sarContractAddress ?? '');
      const nftTokenId = hederaFn.contractToTokenId(sarContractId);
      return hederaFn.idToAddress(nftTokenId);
    }
    return undefined;
  }, [chainId]);

  const {
    associate: onAssociate,
    hederaAssociated: isHederaTokenAssociated,
    isLoading: isLoadingAssociate,
  } = useHederaTokenAssociated(nftTokenAddress, 'Pangolin Sar NFT');

  const renderButtons = () => {
    if (!account) {
      return (
        <Button padding="15px 18px" variant="primary" onClick={toggleWalletModal}>
          {t('earn.connectWallet')}
        </Button>
      );
    } else if (!userPngBalance?.greaterThan('0')) {
      return (
        <Button padding="15px 18px" variant="primary" as="a" href={getBuyUrl(png, chainId)}>
          {t('sarStake.buy', { symbol: png.symbol })}
        </Button>
      );
    } else if (!isHederaTokenAssociated && isHedera) {
      return (
        <Button variant="primary" isDisabled={Boolean(isLoadingAssociate)} onClick={onAssociate}>
          {isLoadingAssociate ? `${t('pool.associating')}` : `${t('pool.associate')} `}
        </Button>
      );
    } else {
      return (
        <Buttons>
          {showApproveFlow && (
            <Button
              variant={approval === ApprovalState.APPROVED ? 'confirm' : 'primary'}
              isDisabled={approval !== ApprovalState.NOT_APPROVED}
              onClick={onAttemptToApprove}
              height="46px"
            >
              {t('earn.approve')}
            </Button>
          )}
          <Button
            variant={'primary'}
            isDisabled={!selectedPosition || !!error || approval !== ApprovalState.APPROVED}
            onClick={() => setOpenDrawer(true)}
            height="46px"
          >
            {!selectedPosition ? t('sarStakeMore.choosePosition') : error ?? t('sarStakeMore.add')}
          </Button>
        </Buttons>
      );
    }
  };

  const ConfirmContent = (
    <Wrapper paddingX="20px" paddingBottom="20px">
      <Header>
        <TokenRow>
          <Text fontSize={24} fontWeight={500} color="text1" style={{ marginRight: '12px' }}>
            {parsedAmount?.toSignificant(6) ?? 0}
          </Text>
          <CurrencyLogo currency={png} size={24} imageSize={48} />
        </TokenRow>
        <Box display="inline-grid" style={{ gridGap: '10px', gridTemplateColumns: 'auto auto' }}>
          <Stat
            title={t('sarStake.dollarValue')}
            titlePosition="top"
            stat={`$${(dollerWorth ?? 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}`}
            titleColor="text2"
          />
          <Stat title={t('sarStakeMore.newAPR')} titlePosition="top" stat={`${newAPR}%`} titleColor="text2" />
        </Box>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Text color="text1">{t('sarStake.weeklyDistributed', { symbol: png.symbol })}</Text>
          <Text color="text1">{numeral(formatEther(weeklyPNG ?? 0)).format('0.00a')}</Text>
        </Box>
        <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
          {t('sarStake.confirmDescription', { symbol: png.symbol })}
          <br />
          <br />
          {t('sarStakeMore.confirmDescription', { symbol: png.symbol })}
        </Text>
      </Header>
      <Footer>
        <Box my={'10px'}>
          <Button variant="primary" onClick={onStake}>
            {t('sarStakeMore.add')}
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
              {t('sarStakeMore.stakeMore')}
            </Text>
            <Text color="text4">
              {t('sarStake.walletBalance', { symbol: png.symbol, balance: userPngBalance?.toFixed(2) ?? 0 })}
            </Text>
          </Box>
          <TextInput
            value={typedValue}
            isNumeric={true}
            placeholder="0.00"
            onChange={(value: any) => {
              onUserInput(value);
            }}
            addonAfter={
              <Button variant="plain" backgroundColor="color2" padding="6px" height="auto" onClick={handleMax}>
                <Text color="text1">MAX</Text>
              </Button>
            }
          />
        </Box>
        <Box display="grid" bgColor="color3" borderRadius="4px" padding="20px" style={{ gridGap: '20px' }}>
          <Box display="flex" justifyContent="space-between">
            <Box maxWidth="150px" style={{ overflow: 'hidden' }}>
              <Text color="text2">{t('sarStake.dollarValue')}</Text>
              <Text color="text1">{dollerWorth ? `$ ${numeral(dollerWorth).format('0.00a')}` : '-'}</Text>
            </Box>
            <Box>
              <Text color="text2">{t('sarStake.averageAPR')}</Text>
              <Text color="text1">{`${(apr ?? '-').toString()}%`}</Text>
            </Box>
          </Box>
          <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
            {t('sarStakeMore.confirmDescription', { symbol: png.symbol })}
          </Text>
        </Box>
        {renderButtons()}
      </Root>

      <ConfirmDrawer
        title={stakeError || hash || attempting ? '' : t('sarStake.summary')}
        isOpen={openDrawer && !!selectedPosition}
        onClose={handleConfirmDismiss}
        attemptingTxn={attempting}
        txHash={hash}
        errorMessage={stakeError}
        pendingMessage={t('sarStakeMore.pending', { balance: parsedAmount?.toFixed(2) ?? 0, symbol: png.symbol })}
        successMessage={t('sarStake.successSubmit')}
        confirmContent={ConfirmContent}
      />
    </Box>
  );
}
