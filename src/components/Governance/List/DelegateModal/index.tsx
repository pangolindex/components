import { isAddress } from 'ethers/lib/utils';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Loader, Modal, Text } from 'src/components';
import { AutoColumn } from 'src/components/Column';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3, usePngSymbol } from 'src/hooks';
import useENS from 'src/hooks/useENS';
import { useDelegateCallback } from 'src/state/governance/hooks/evm';
import { useTokenBalance } from 'src/state/pwallet/hooks/evm';
import { ExternalLink } from 'src/theme';
import { CloseIcon } from 'src/theme/components';
import { getEtherscanLink } from 'src/utils';
import AddressInputPanel from '../AddressInputPanel';
import { ContentWrapper, DelegateModalWrapper, TextButton, Wrapper } from './styleds';

interface VoteModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  title: string;
}

export default function DelegateModal({ isOpen, onDismiss, title }: VoteModalProps) {
  const { account } = usePangolinWeb3();
  const { t } = useTranslation();
  const chainId = useChainId();
  const pngSymbol = usePngSymbol();

  // get theme for colors
  const theme = useContext(ThemeContext);

  // state for delegate input
  const [usingDelegate, setUsingDelegate] = useState(false);
  const [typed, setTyped] = useState('');
  function handleRecipientType(val: string) {
    setTyped(val);
  }

  // monitor for self delegation or input for third part delegate
  // default is self delegation
  const activeDelegate = usingDelegate ? typed : account;
  const { address: parsedAddress } = useENS(activeDelegate);

  // get the number of votes available to delegate
  const pngBalance = useTokenBalance(account ?? undefined, chainId ? PNG[chainId] : undefined);

  const delegateCallback = useDelegateCallback();

  // monitor call to help UI loading state
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState(false);

  // wrapper to reset state on modal close
  function wrappedOndismiss() {
    setHash(undefined);
    setAttempting(false);
    onDismiss();
  }

  async function onDelegate() {
    setAttempting(true);

    // if callback not returned properly ignore
    if (!delegateCallback) return;

    // try delegation and store hash
    const _hash = await delegateCallback(parsedAddress ?? undefined)?.catch((error) => {
      setAttempting(false);
      console.log(error);
    });

    if (_hash) {
      setHash(_hash);
    }
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss}>
      <DelegateModalWrapper>
        <Wrapper>
          <Text fontWeight={500} fontSize={20}>
            {title}
          </Text>
          <CloseIcon onClick={wrappedOndismiss} color={theme.text3} />
        </Wrapper>

        {!attempting && !hash && (
          <ContentWrapper gap="24px">
            <AutoColumn gap="24px" justify="center">
              <Text fontWeight={400} fontSize={16} color={'text1'}>
                {t('vote.earnedPng', { pngSymbol: pngSymbol })}
              </Text>
              <Text fontWeight={400} fontSize={16} color={'text1'}>
                {t('vote.canEitherVote')}
              </Text>
              {usingDelegate && <AddressInputPanel value={typed} onChange={handleRecipientType} />}
              <Button variant="primary" isDisabled={!isAddress(parsedAddress ?? '')} onClick={onDelegate}>
                <Text fontWeight={500} fontSize={20} color="white">
                  {usingDelegate ? t('vote.delegateVotes') : t('vote.selfDelegate')}
                </Text>
              </Button>
              <TextButton onClick={() => setUsingDelegate(!usingDelegate)}>
                <Text fontWeight={500} color={'primary1'}>
                  {usingDelegate ? t('vote.remove') : t('vote.add')} {t('vote.delegate')} {!usingDelegate && '+'}
                </Text>
              </TextButton>
            </AutoColumn>
          </ContentWrapper>
        )}
        {attempting && !hash && (
          <Box>
            <Loader size={100} label={usingDelegate ? t('vote.delegatingVotes') : t('vote.unlockingVotes')} />

            <AutoColumn gap="100px" justify={'center'}>
              <Text fontWeight={500} color={'text2'} fontSize={36}>
                {pngBalance?.toSignificant(4)}
              </Text>
            </AutoColumn>
          </Box>
        )}
        {hash && (
          <AutoColumn gap="100px" justify={'center'}>
            <AutoColumn gap="12px" justify={'center'}>
              <Text fontWeight={600} fontSize={24}>
                {t('vote.transactionSubmitted')}
              </Text>
              <Text fontWeight={500} color={'text2'} fontSize={36}>
                {pngBalance?.toSignificant(4)}
              </Text>
            </AutoColumn>
            {chainId && hash && (
              <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')} style={{ marginLeft: '4px' }}>
                <Text fontWeight={400} fontSize={14}>
                  {t('modalView.viewTransaction')}
                </Text>
              </ExternalLink>
            )}
          </AutoColumn>
        )}
      </DelegateModalWrapper>
    </Modal>
  );
}
