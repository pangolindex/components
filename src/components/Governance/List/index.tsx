import { ChainId, JSBI, TokenAmount } from '@pangolindex/sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Loader, Text } from 'src/components';
import { ZERO_ADDRESS } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChain, useChainId, usePangolinWeb3, usePngSymbol } from 'src/hooks';
import { ProposalData, useGetProposalsViaSubgraph, useUserDelegatee, useUserVotes } from 'src/state/governance/hooks';
import { ApplicationModal } from 'src/state/papplication/atom';
import { useModalOpen, useToggleDelegateModal } from 'src/state/papplication/hooks';
import { useTokenBalance } from 'src/state/pwallet/hooks/evm';
import { getEtherscanLink, shortenAddress } from 'src/utils';
import DelegateModal from './DelegateModal';
import FormattedCurrencyAmount from './FormattedCurrencyAmount';
import GovernanceCard, { ProposalStates } from './GovernanceCard';
import {
  About,
  AddressButton,
  ContentWrapper,
  DefaultButton,
  DelegatInfo,
  DelegateWarpper,
  PageTitle,
  PageWrapper,
  StyledExternalLink,
  TextButton,
  WrapSmall,
  // EmptyProposals
} from './styleds';

const GovernanceList = () => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const chain = useChain(chainId);
  const { t } = useTranslation();
  const pngSymbol = usePngSymbol();

  // toggle for showing delegation modal
  const showDelegateModal = useModalOpen(ApplicationModal.DELEGATE);
  const toggleDelegateModal = useToggleDelegateModal();

  // get data to list all proposals
  const allProposals: ProposalData[] = useGetProposalsViaSubgraph();

  // user data
  const availableVotes: TokenAmount | undefined = useUserVotes();
  const pngBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, PNG[chainId]);
  const userDelegatee: string | undefined = useUserDelegatee();

  // show delegation option if they have have a balance, but have not delegated
  const showUnlockVoting = Boolean(
    pngBalance && JSBI.notEqual(pngBalance.raw, JSBI.BigInt(0)) && userDelegatee === ZERO_ADDRESS,
  );

  function getAddress() {
    if (userDelegatee === account) {
      return 'Self';
    }
    return userDelegatee ? shortenAddress(userDelegatee, chainId) : '';
  }

  return (
    <PageWrapper>
      <DelegateModal
        isOpen={showDelegateModal}
        onDismiss={toggleDelegateModal}
        title={showUnlockVoting ? t('votePage.unlockVotes') : t('votePage.updateDelegation')}
      />
      <PageTitle>{t('votePage.pangolinGovernance')}</PageTitle>
      <ContentWrapper>
        <About>
          <Text fontSize={22} fontWeight={800} lineHeight="33px" color="text10" style={{ marginBottom: '14px' }}>
            {t('votePage.about')}
          </Text>
          <Text fontSize={14} lineHeight="24px" color="text10">
            {t('votePage.earnedPngTokens', { pngSymbol: pngSymbol })}
          </Text>
          <Text fontSize={14} lineHeight="24px" color="text10">
            {t('votePage.eligibleToVote', { pngSymbol: pngSymbol })}
          </Text>
          <Text fontSize={14} lineHeight="24px" color="text10">
            {t('votePage.governanceVotes')}
          </Text>
        </About>
        {chain.contracts?.governor ? (
          <>
            <WrapSmall style={{ justifyContent: 'flex-end', marginTop: '8px' }}>
              {showUnlockVoting ? (
                <DefaultButton variant="primary" onClick={toggleDelegateModal}>
                  {t('votePage.unlockVoting')}
                </DefaultButton>
              ) : availableVotes && JSBI.notEqual(JSBI.BigInt(0), availableVotes?.raw) ? (
                <Text fontWeight={500} fontSize={16} color={'text1'} mr="6px">
                  <FormattedCurrencyAmount currencyAmount={availableVotes} /> {t('votePage.votes')}
                </Text>
              ) : pngBalance &&
                userDelegatee &&
                userDelegatee !== ZERO_ADDRESS &&
                JSBI.notEqual(JSBI.BigInt(0), pngBalance?.raw) ? (
                <Text fontWeight={500} fontSize={16} color={'text1'} mr="6px">
                  <FormattedCurrencyAmount currencyAmount={pngBalance} /> {t('votePage.votes')}
                </Text>
              ) : (
                ''
              )}
            </WrapSmall>
            {!showUnlockVoting && (
              <DelegateWarpper>
                <div />
                {userDelegatee && userDelegatee !== ZERO_ADDRESS ? (
                  <DelegatInfo>
                    <Text fontWeight={400} fontSize={16} color={'text1'} mr="4px">
                      {t('votePage.delegatedTo')}
                    </Text>
                    <AddressButton>
                      <StyledExternalLink
                        href={getEtherscanLink(ChainId.FUJI, userDelegatee, 'address')}
                        style={{ margin: '0 4px' }}
                      >
                        {getAddress()}
                      </StyledExternalLink>
                      <TextButton
                        onClick={toggleDelegateModal}
                        style={{ marginLeft: '4px' }}
                        fontWeight={500}
                        color={'text2'}
                      >
                        ({t('votePage.edit')})
                      </TextButton>
                    </AddressButton>
                  </DelegatInfo>
                ) : (
                  ''
                )}
              </DelegateWarpper>
            )}
            {(!allProposals || allProposals.length === 0) && (
              <div style={{ textAlign: 'center', margin: '30px' }}>
                <Loader size={100} />
              </div>
            )}
            {allProposals?.map((p: ProposalData) => {
              return (
                <GovernanceCard
                  id={p.id}
                  title={p.title}
                  status={p.status as ProposalStates}
                  to={`/vote/${p.id}`}
                  key={p.id}
                />
              );
            })}
          </>
        ) : (
          <Box width="100%" marginTop={20} display="flex" justifyContent="center">
            <Text color="text1" fontSize={22}>
              {t('votePage.notSupported')}
            </Text>
          </Box>
        )}
      </ContentWrapper>
    </PageWrapper>
  );
};
export default GovernanceList;
