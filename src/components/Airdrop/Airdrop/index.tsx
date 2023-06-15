import { AVALANCHE_MAINNET, AirdropType, Chain, Token, TokenAmount } from '@pangolindex/sdk';
import { formatUnits } from 'ethers/lib/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Loader, Text, Tooltip } from 'src/components';
import { usePangolinWeb3 } from 'src/hooks';
import { useClaimAirdrop, useMerkledropClaimedAmounts, useMerkledropProof } from 'src/state/airdrop/hooks';
import { getChainByNumber } from 'src/utils';
import Title from '../Title';
import { Wrapper } from '../styleds';
import ChangeChain from './ChangeChain';
import AlreadyClaimed from './Claimed';
import ConfirmDrawer from './ConfirmDrawer';
import NotConnected from './NotConnected';
import NotEligible from './NotEligible';

interface Props {
  /** Airdrop Contract address */
  contractAddress: string;
  /** Airdrop contract type */
  type: AirdropType;
  /* Title of airdrop*/
  title?: string;
  /** Token to be airdropped */
  token: Token;
  /** Token Logo */
  logo: string;
  /** The airdropped chain */
  chain?: Chain;
  /** Function to executed  on complete*/
  onComplete?: (airdropType) => void;
}

export default function Airdrop({ contractAddress, type, title, logo, token, chain, onComplete }: Props) {
  const { account, chainId } = usePangolinWeb3();
  const [openDrawer, setOpenDrawer] = useState(false);

  const { onClaim, onDimiss, hash, attempting, error } = useClaimAirdrop(contractAddress, type, token);

  const { data, isLoading: isLoadingProof } = useMerkledropProof(contractAddress, token);
  const { data: _claimedAmount, isLoading } = useMerkledropClaimedAmounts(contractAddress, token);

  const claimedAmount = _claimedAmount ?? new TokenAmount(token, '0');

  const claimAmount = data?.amount ?? new TokenAmount(token, '0');
  const totalToClaim = claimAmount.equalTo('0') ? new TokenAmount(token, '0') : claimAmount.subtract(claimedAmount);

  const airdropChain = chain ? chain : getChainByNumber(token.chainId);

  const handleConfirmDismiss = useCallback(() => {
    onDimiss();
    setOpenDrawer(false);
  }, [onDimiss]);

  useEffect(() => {
    if (openDrawer && !attempting && !hash && !error) {
      handleConfirmDismiss();
    }
    if (!openDrawer && attempting) {
      setOpenDrawer(true);
    }
  }, [handleConfirmDismiss, attempting, error, hash, openDrawer]);

  if (isLoading || isLoadingProof) {
    return (
      <Wrapper>
        <Loader size={40} />
      </Wrapper>
    );
  }

  if (!account) {
    return <NotConnected title={title} logo={logo} token={token} />;
  }
  if (chainId !== token.chainId) {
    return <ChangeChain logo={logo} chain={airdropChain ?? AVALANCHE_MAINNET} />;
  }

  if (claimAmount.lessThan('0') || claimAmount.equalTo('0')) {
    return <NotEligible subtitle={title} logo={logo} token={token} />;
  }

  if ((totalToClaim.lessThan('0') || totalToClaim.equalTo('0')) && !hash && !attempting && !error) {
    return <AlreadyClaimed subtitle={title} logo={logo} />;
  }

  return (
    <Wrapper>
      <Title title="You Are Eligible!" subtitle={title} logo={logo} />
      <Box display="flex" alignItems="center" minHeight="150px">
        <Text fontSize={16} fontWeight={500} color="text10">
          You are eligible for:
        </Text>
        <Tooltip id="airdrop-amount">
          <Text fontSize={[22, 18]} fontWeight={700} color="primary" ml="10px">
            {formatUnits(totalToClaim.raw.toString(), token.decimals)} {token.symbol}
          </Text>
        </Tooltip>
        <Text fontSize={[22, 18]} fontWeight={700} color="primary" ml="10px" data-tip data-for="airdrop-amount">
          {totalToClaim.toFixed(2)} {token.symbol}
        </Text>
      </Box>
      <Button variant="primary" color="black" height="46px" onClick={onClaim}>
        CLAIM
      </Button>
      <ConfirmDrawer
        isOpen={openDrawer}
        onClose={handleConfirmDismiss}
        attemptingTxn={attempting}
        txHash={hash}
        errorMessage={error}
        airdropType={type}
        logo={logo}
        onComplete={onComplete}
      />
    </Wrapper>
  );
}
