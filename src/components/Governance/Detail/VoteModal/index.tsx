import { CHAINS, GovernanceType, TokenAmount } from '@pangolindex/sdk';
import { BigNumber } from 'ethers';
import React, { useContext, useState } from 'react';
import { ArrowUpCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Loader, Modal, Text } from 'src/components';
import { AutoColumn } from 'src/components/Column';
import Portfolio from 'src/components/SarNFTPortfolio/Portfolio';
import { useChainId } from 'src/hooks';
import { useVoteCallbackHook } from 'src/state/governance/hooks';
import { useUserVotes } from 'src/state/governance/hooks/evm';
import { Position } from 'src/state/psarstake/types';
import { ExternalLink } from 'src/theme';
import { CloseIcon } from 'src/theme/components';
import { getEtherscanLink } from 'src/utils';
import { ConfirmOrLoadingWrapper, ConfirmedIcon, ContentWrapper, Wrapper } from './styleds';

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
    onDismiss();
  }

  async function onVote() {
    setAttempting(true);

    // if callback not returned properly ignore
    if (!voteCallback) return;

    // try delegation and store hash
    const _hash = await voteCallback(proposalId, support, selectedPosition?.id)?.catch((error) => {
      setAttempting(false);
      console.log(error);
    });

    if (_hash) {
      setHash(_hash);
    }
  }

  const renderModalBody = () => {
    if (CHAINS[chainId]?.contracts?.governor?.type === GovernanceType.SAR_NFT) {
      return (
        <Box>
          <Text fontSize={24} fontWeight={500} color="text1">
            Choose NFTs to Vote: {support ? t('vote.for') : t('vote.against')}
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
        {!attempting && !hash && !nftLoading && <>{renderModalBody()}</>}
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
      </ConfirmOrLoadingWrapper>
    </Modal>
  );
}
