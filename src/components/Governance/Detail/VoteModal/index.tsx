import { TokenAmount } from '@pangolindex/sdk';
import React, { useContext, useState } from 'react';
import { ArrowUpCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import Circle from 'src/assets/images/blue-loader.svg';
import { Button, Modal, Text } from 'src/components';
import { AutoColumn } from 'src/components/Column';
import { useChainId } from 'src/hooks';
import { useUserVotes, useVoteCallback } from 'src/state/governance/hooks';
import { ExternalLink } from 'src/theme';
import { getEtherscanLink } from 'src/utils';
import {
  ConfirmOrLoadingWrapper,
  ConfirmedIcon,
  ContentWrapper,
  CustomLightSpinner,
  StyledClosed,
  Wrapper,
} from './styleds';

interface VoteModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  support: boolean; // if user is for or against proposal
  proposalId: string | undefined; // id for the proposal to vote on
}

export default function VoteModal({ isOpen, onDismiss, proposalId, support }: VoteModalProps) {
  const chainId = useChainId();
  const {
    voteCallback,
  }: {
    voteCallback: (proposalId: string | undefined, support: boolean) => Promise<string> | undefined;
  } = useVoteCallback();
  const availableVotes: TokenAmount | undefined = useUserVotes();

  // monitor call to help UI loading state
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState<boolean>(false);

  // get theme for colors
  const theme = useContext(ThemeContext);

  const { t } = useTranslation();

  // wrapper to reset state on modal close
  function wrappedOndismiss() {
    setHash(undefined);
    setAttempting(false);
    onDismiss();
  }

  async function onVote() {
    setAttempting(true);

    // if callback not returned properly ignore
    if (!voteCallback) return;

    // try delegation and store hash
    const _hash = await voteCallback(proposalId, support)?.catch((error) => {
      setAttempting(false);
      console.log(error);
    });

    if (_hash) {
      setHash(_hash);
    }
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss}>
      {!attempting && !hash && (
        <ContentWrapper gap="24px">
          <AutoColumn gap="24px" justify="center">
            <Wrapper>
              <Text fontWeight={500} fontSize={20}>
                {t('vote.vote')} {support ? t('vote.for') : t('vote.against')} {t('vote.proposal')} {proposalId}
              </Text>
              <StyledClosed stroke="black" onClick={wrappedOndismiss} />
            </Wrapper>
            <Text fontWeight={600} fontSize={24}>
              {availableVotes?.toSignificant(4)} {t('vote.votes')}
            </Text>
            <Button variant="primary" onClick={onVote}>
              <Text fontWeight={500} fontSize={20} color="white">
                {t('vote.vote')} {support ? t('vote.for') : t('vote.against')} {t('vote.proposal')} {proposalId}
              </Text>
            </Button>
          </AutoColumn>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <ConfirmOrLoadingWrapper>
          <Wrapper>
            <div />
            <StyledClosed onClick={wrappedOndismiss} />
          </Wrapper>
          <ConfirmedIcon>
            <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
          </ConfirmedIcon>
          <AutoColumn gap="100px" justify={'center'}>
            <AutoColumn gap="12px" justify={'center'}>
              <Text fontWeight={600} fontSize={24}>
                {t('vote.submittingVote')}{' '}
              </Text>
            </AutoColumn>
            <Text fontWeight={400} fontSize={14}>
              {t('vote.confirmTransaction')}
            </Text>
          </AutoColumn>
        </ConfirmOrLoadingWrapper>
      )}
      {hash && (
        <ConfirmOrLoadingWrapper>
          <Wrapper>
            <div />
            <StyledClosed onClick={wrappedOndismiss} />
          </Wrapper>
          <ConfirmedIcon>
            <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.primary1} />
          </ConfirmedIcon>
          <AutoColumn gap="100px" justify={'center'}>
            <AutoColumn gap="12px" justify={'center'}>
              <Text fontWeight={600} fontSize={24}>
                {t('vote.transactionSubmitted')}
              </Text>
            </AutoColumn>
            {chainId && (
              <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')} style={{ marginLeft: '4px' }}>
                <Text fontWeight={400} fontSize={14}>
                  {t('vote.viewExplorer')}
                </Text>
              </ExternalLink>
            )}
          </AutoColumn>
        </ConfirmOrLoadingWrapper>
      )}
    </Modal>
  );
}
