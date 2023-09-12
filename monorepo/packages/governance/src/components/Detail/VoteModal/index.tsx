import { AutoColumn, Box, Button, CloseIcon, Loader, Modal, Text } from '@honeycomb/core';
import { Portfolio, Position } from '@honeycomb/sar';
import { CHAINS, GovernanceType, TokenAmount } from '@pangolindex/sdk';
import { ExternalLink, getEtherscanLink, useChainId, useTranslation } from '@honeycomb/shared';
import { BigNumber } from 'ethers';
import React, { useContext, useState } from 'react';
import { AlertTriangle, ArrowUpCircle } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { useVoteCallbackHook } from 'src/hooks';
import { useUserVotes } from 'src/hooks/evm';
import { ConfirmOrLoadingWrapper, ConfirmedIcon, ContentWrapper, ErrorBox, ErrorWrapper, Wrapper } from './styleds';

interface VoteModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  support: boolean; // if user is for or against proposal
  proposalId: string | undefined; // id for the proposal to vote on
  filteredPositions: Position[];
  nftLoading?: boolean;
}

export default function VoteModal({
  isOpen,
  onDismiss,
  proposalId,
  support,
  filteredPositions,
  nftLoading,
}: VoteModalProps) {
  const chainId = useChainId();

  const [voteErrorMessage, setVoteErrorMessage] = useState<string | undefined>(undefined);

  const useVoteCallback = useVoteCallbackHook[chainId];

  const {
    voteCallback,
  }: {
    voteCallback: (
      proposalId: string | undefined,
      support: boolean,
      nftId?: BigNumber,
    ) => Promise<string | undefined> | undefined;
  } = useVoteCallback();
  const availableVotes: TokenAmount | undefined = useUserVotes();

  // monitor call to help UI loading state
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState<boolean>(false);

  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const onSelectPosition = (position: Position | null) => {
    setSelectedPosition(position);
  };

  // get theme for colors
  const theme = useContext(ThemeContext);

  const { t } = useTranslation();

  // wrapper to reset state on modal close
  function wrappedOndismiss() {
    setHash(undefined);
    setAttempting(false);
    setVoteErrorMessage(undefined);
    onDismiss();
  }

  async function onVote() {
    try {
      setAttempting(true);

      // if callback not returned properly ignore
      if (!voteCallback) return;

      // try delegation and store hash
      const _hash = await voteCallback(proposalId, support, selectedPosition?.id);
      if (_hash) {
        setHash(_hash);
      } else {
        setAttempting(false);
        setVoteErrorMessage('Something went wrong');
      }
    } catch (err: any) {
      setAttempting(false);
      const _err = err as any;

      setVoteErrorMessage(err?.message);
      // we only care if the error is something _other_ than the user rejected the tx
      if (_err?.code !== 4001) {
        console.error(_err);
      }
    }
  }

  const renderModalBody = () => {
    if (CHAINS[chainId]?.contracts?.governor?.type === GovernanceType.SAR_NFT) {
      return (
        <Box>
          <Text fontSize={24} fontWeight={500} color="text1" pb={10}>
            Choose NFTs to Vote: {support ? t('vote.for').toUpperCase() : t('vote.against').toUpperCase()}
          </Text>
          <Portfolio positions={filteredPositions} onSelectPosition={onSelectPosition} allowSorting={false} />

          <Button variant="primary" onClick={onVote} isDisabled={!selectedPosition}>
            <Text fontWeight={500} fontSize={20} color="white">
              {t('vote.vote')} {support ? t('vote.for') : t('vote.against')} {t('vote.proposal')} {proposalId}
            </Text>
          </Button>
        </Box>
      );
    } else {
      return (
        <ContentWrapper gap="24px">
          <AutoColumn gap="24px" justify="center">
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
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss}>
      <ConfirmOrLoadingWrapper type={CHAINS[chainId]?.contracts?.governor?.type}>
        <Wrapper>
          <div />

          <CloseIcon onClick={wrappedOndismiss} color={theme.text3} />
        </Wrapper>
        {!attempting && !hash && !nftLoading && !voteErrorMessage && <>{renderModalBody()}</>}
        {nftLoading && (
          <Box>
            <Loader size={100} label={`${t('common.loading')}...`} />{' '}
          </Box>
        )}
        {attempting && !hash && !nftLoading && (
          <Box>
            <Loader size={100} label={`${t('vote.submittingVote')}...`} />

            <AutoColumn gap="100px" justify={'center'}>
              <Text fontWeight={400} fontSize={14}>
                {t('vote.confirmTransaction')}
              </Text>
            </AutoColumn>
          </Box>
        )}
        {hash && (
          <Box>
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
          </Box>
        )}

        {voteErrorMessage && (
          <ErrorWrapper>
            <ErrorBox>
              <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
              <Text fontWeight={500} fontSize={[16, 14]} color={'red1'} style={{ textAlign: 'center', width: '85%' }}>
                {voteErrorMessage || 'Something went wrong'}
              </Text>
            </ErrorBox>
            <Button variant="primary" onClick={wrappedOndismiss}>
              {t('transactionConfirmation.dismiss')}
            </Button>
          </ErrorWrapper>
        )}
      </ConfirmOrLoadingWrapper>
    </Modal>
  );
}
