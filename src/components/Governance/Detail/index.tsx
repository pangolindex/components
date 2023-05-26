import { CHAINS, GovernanceType, JSBI, TokenAmount } from '@pangolindex/sdk';
import { DateTime } from 'luxon';
import React, { useMemo, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Button, Loader, Text } from 'src/components';
import { AutoColumn } from 'src/components/Column';
import { ZERO_ADDRESS } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useGetProposalDetailViaSubgraph } from 'src/state/governance/hooks/common';
import { useUserDelegatee, useUserVotes } from 'src/state/governance/hooks/evm';
import { ProposalData } from 'src/state/governance/types';
import { useSarPositionsHook } from 'src/state/psarstake/hooks';
import { useTokenBalance } from 'src/state/pwallet/hooks/evm';
import { ExternalLink } from 'src/theme';
import { getEtherscanLink, isAddress } from 'src/utils';
import VoteModal from './VoteModal';
import {
  ArrowWrapper,
  ButtonWrapper,
  CardSection,
  CardWrapper,
  DetailText,
  MarkDownWrapper,
  PageWrapper,
  Progress,
  ProgressWrapper,
  ProposalInfo,
  ProposalStatus,
  StyledDataCard,
  WrapSmall,
  Wrapper,
} from './styleds';

export type GovernanceDetailProps = Record<'id', 'string'>;

const GovernanceDetail: React.FC<GovernanceDetailProps> = ({ id }) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { t } = useTranslation();

  // get data for this specific proposal
  const proposalData: ProposalData | undefined = useGetProposalDetailViaSubgraph(id as string);

  // update support based on button interactions
  const [support, setSupport] = useState<boolean>(true);

  // modal for casting votes
  const [showModal, setShowModal] = useState<boolean>(false);

  //sar nft
  const useSarPositions = useSarPositionsHook[chainId];
  const { positions, isLoading } = useSarPositions();

  // sort by balance
  const filteredPositions = useMemo(
    () =>
      positions
        ?.filter((position) => !position.balance.isZero())
        .sort((a, b) => Number(b.balance.sub(a.balance).toString())), // remove zero balances and sort by balance
    [positions],
  );

  // get and format date from data
  const startTimestamp: number | undefined = proposalData?.startTime;
  const endTimestamp: number | undefined = proposalData?.endTime;
  const startDate: DateTime | undefined = startTimestamp ? DateTime.fromSeconds(startTimestamp) : undefined;
  const endDate: DateTime | undefined = endTimestamp ? DateTime.fromSeconds(endTimestamp) : undefined;
  const now: DateTime = DateTime.local();

  // get total votes and format percentages for UI
  const totalVotes: number | undefined = proposalData ? proposalData.forCount + proposalData.againstCount : undefined;
  const forPercentage: string =
    proposalData && totalVotes ? ((proposalData.forCount * 100) / totalVotes).toFixed(0) + '%' : '0%';
  const againstPercentage: string =
    proposalData && totalVotes ? ((proposalData.againstCount * 100) / totalVotes).toFixed(0) + '%' : '0%';

  // show delegation option if they have have a balance, have not delegated
  const availableVotes: TokenAmount | undefined = useUserVotes();
  const uniBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, chainId ? PNG[chainId] : undefined);
  const userDelegatee: string | undefined = useUserDelegatee();

  const showUnlockVoting =
    CHAINS[chainId]?.contracts?.governor?.type === GovernanceType.SAR_NFT
      ? filteredPositions?.length === 0
      : Boolean(uniBalance && JSBI.notEqual(uniBalance.raw, JSBI.BigInt(0)) && userDelegatee === ZERO_ADDRESS);

  const checkDateValidation = endDate && endDate > now && startDate && startDate <= now;

  const checkAvailableVotes =
    CHAINS[chainId]?.contracts?.governor?.type === GovernanceType.STANDARD &&
    availableVotes &&
    JSBI.greaterThan(availableVotes?.raw, JSBI.BigInt(0));

  const checkForV1 = !showUnlockVoting && checkAvailableVotes && checkDateValidation;

  const checkForV2 = !showUnlockVoting && checkDateValidation;

  // show links in propsoal details if content is an address
  const linkIfAddress = (content: string) => {
    if (isAddress(content) && chainId) {
      return <ExternalLink href={getEtherscanLink(chainId, content, 'address')}>{content}</ExternalLink>;
    }
    return <span>{content}</span>;
  };

  return (
    <PageWrapper gap="24px" justify="center">
      <VoteModal
        isOpen={showModal}
        onDismiss={() => setShowModal(false)}
        proposalId={proposalData?.id}
        support={support}
        filteredPositions={filteredPositions}
        nftLoading={isLoading}
      />

      <ProposalInfo gap="24px" justify="start">
        <Wrapper>
          <ArrowWrapper href={'/#/vote'}>
            <ArrowLeft size={20} /> {t('votePage.backToProposals')}
          </ArrowWrapper>
          {proposalData && <ProposalStatus status={proposalData?.status ?? ''}>{proposalData?.status}</ProposalStatus>}
        </Wrapper>
        <AutoColumn gap="10px" style={{ width: '100%' }}>
          <Text fontSize={32} lineHeight="52px" color="text1" style={{ marginBottom: '.5rem' }}>
            {proposalData?.title}
          </Text>

          <Wrapper>
            <Text fontSize={14} color="text1">
              {startDate && startDate <= now
                ? t('votePage.votingStarted') + (startDate && startDate.toLocaleString(DateTime.DATETIME_FULL))
                : proposalData
                ? t('votePage.votingStarts') + (startDate && startDate.toLocaleString(DateTime.DATETIME_FULL))
                : ''}
            </Text>
          </Wrapper>
          <Wrapper>
            <Text fontSize={14} color="text1">
              {endDate && endDate < now
                ? t('votePage.votingEnded') + (endDate && endDate.toLocaleString(DateTime.DATETIME_FULL))
                : proposalData
                ? t('votePage.votingEnds') + (endDate && endDate.toLocaleString(DateTime.DATETIME_FULL))
                : ''}
            </Text>
          </Wrapper>
        </AutoColumn>
        {checkForV1 || checkForV2 ? (
          <ButtonWrapper style={{ width: '100%', gap: '12px' }}>
            <Button
              variant="primary"
              padding="8px"
              borderRadius="8px"
              onClick={() => {
                setSupport(true);
                setShowModal(true);
              }}
            >
              {t('votePage.voteFor')}
            </Button>
            <Button
              variant="primary"
              padding="8px"
              borderRadius="8px"
              onClick={() => {
                setSupport(false);
                setShowModal(true);
              }}
            >
              {t('votePage.voteAgainst')}
            </Button>
          </ButtonWrapper>
        ) : (
          ''
        )}
        <CardWrapper>
          <StyledDataCard>
            <CardSection>
              <AutoColumn gap="md">
                <WrapSmall>
                  <Text fontWeight={500} fontSize={12} lineHeight="24px" color="text1">
                    {t('votePage.for')}
                  </Text>
                  <Text fontWeight={500} fontSize={12} lineHeight="24px" color="text11">
                    {proposalData?.forCount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Text>
                </WrapSmall>
              </AutoColumn>
              <ProgressWrapper>
                <Progress status={'for'} percentageString={forPercentage} />
              </ProgressWrapper>
            </CardSection>
          </StyledDataCard>
          <StyledDataCard>
            <CardSection>
              <AutoColumn gap="md">
                <WrapSmall>
                  <Text fontWeight={500} fontSize={12} lineHeight="24px" color="text1">
                    {t('votePage.against')}
                  </Text>
                  <Text fontWeight={500} fontSize={12} lineHeight="24px" color="text12">
                    {proposalData?.againstCount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Text>
                </WrapSmall>
              </AutoColumn>
              <ProgressWrapper>
                <Progress status={'against'} percentageString={againstPercentage} />
              </ProgressWrapper>
            </CardSection>
          </StyledDataCard>
        </CardWrapper>
        <StyledDataCard style={{ borderRadius: '12px' }}>
          <CardSection style={{ padding: '25px 30px', display: 'block' }}>
            <AutoColumn gap="md">
              <Text fontWeight={800} fontSize={22} lineHeight="33px" color="text1">
                {t('votePage.details')}
              </Text>
              {proposalData?.details?.map((d, index) => {
                return (
                  <DetailText key={index}>
                    {index + 1}: {linkIfAddress(d.target)}.{d.functionSig}(
                    {d.callData.split(',').map((content, j) => {
                      return (
                        <span key={j}>
                          {linkIfAddress(content)}
                          {d.callData.split(',').length - 1 === j ? '' : ','}
                        </span>
                      );
                    })}
                    )
                  </DetailText>
                );
              })}
            </AutoColumn>
            <AutoColumn gap="md" style={{ marginTop: '30px' }}>
              {proposalData?.description ? (
                <>
                  <Text fontWeight={800} fontSize={22} lineHeight="33px" color="text1">
                    {t('votePage.overview')}
                  </Text>
                  <MarkDownWrapper>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{proposalData?.description}</ReactMarkdown>
                  </MarkDownWrapper>
                </>
              ) : (
                <Loader size={100} />
              )}
            </AutoColumn>
            <Box style={{ wordWrap: 'break-word' }}>
              {proposalData?.proposer && (
                <>
                  <Text fontWeight={800} fontSize={22} lineHeight="33px" color="text1">
                    {t('votePage.proposer')}
                  </Text>
                  <ExternalLink
                    href={
                      proposalData?.proposer && chainId
                        ? getEtherscanLink(chainId, proposalData?.proposer, 'address')
                        : ''
                    }
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{proposalData?.proposer}</ReactMarkdown>
                  </ExternalLink>
                </>
              )}
            </Box>
          </CardSection>
        </StyledDataCard>
      </ProposalInfo>
    </PageWrapper>
  );
};

export default GovernanceDetail;
