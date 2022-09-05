import { Token } from '@pangolindex/sdk';
import React, { useCallback, useMemo, useState } from 'react';
import { ExternalLink } from 'src/theme';
import { getEtherscanLink, shortenAddress } from 'src/utils';
import { Box, Button, CurrencyLogo, Modal, Text } from '../../';
import { usePangolinWeb3 } from '../../../hooks';
import { useAllTokens } from '../../../hooks/Tokens';
import { AutoColumn, StyledWarningIcon, WarningContainer, Wrapper } from './styled';

interface TokenWarningCardProps {
  token?: Token;
}

function TokenWarningCard({ token }: TokenWarningCardProps) {
  const { chainId } = usePangolinWeb3();

  const tokenSymbol = token?.symbol?.toLowerCase() ?? '';
  const tokenName = token?.name?.toLowerCase() ?? '';

  const allTokens = useAllTokens();

  const duplicateNameOrSymbol = useMemo(() => {
    if (!token || !chainId) return false;

    return Object.keys(allTokens).some((tokenAddress) => {
      const userToken = allTokens[tokenAddress];
      if (userToken.equals(token)) {
        return false;
      }
      return userToken.symbol?.toLowerCase() === tokenSymbol || userToken.name?.toLowerCase() === tokenName;
    });
  }, [token, chainId, allTokens, tokenSymbol, tokenName]);

  if (!token) return null;

  return (
    <Wrapper error={duplicateNameOrSymbol}>
      <Box display="flex" alignItems="center" width="100%" flexWrap="wrap" margin="-6px">
        <AutoColumn gap="24px">
          <CurrencyLogo currency={token} size={24} imageSize={48} />
          <div> </div>
        </AutoColumn>
        <AutoColumn gap="10px" justify="flex-start">
          <Text fontWeight={500} fontSize={20} color={'swapWidget.secondary'}>
            {token && token.name && token.symbol && token.name !== token.symbol
              ? `${token.name} (${token.symbol})`
              : token.name || token.symbol}{' '}
          </Text>
          {chainId && (
            <ExternalLink style={{ fontWeight: 400 }} href={getEtherscanLink(chainId, token.address, 'token')}>
              <Text fontWeight={500} color={'primary'} fontSize={16}>
                {shortenAddress(token.address, chainId)} (View on explorer)
              </Text>
            </ExternalLink>
          )}
        </AutoColumn>
      </Box>
    </Wrapper>
  );
}

export default function TokenWarningModal({
  isOpen,
  tokens,
  onConfirm,
}: {
  isOpen: boolean;
  tokens: Token[];
  onConfirm: () => void;
}) {
  const [understandChecked, setUnderstandChecked] = useState(false);
  const toggleUnderstand = useCallback(() => setUnderstandChecked((uc) => !uc), []);

  const handleDismiss = useCallback(() => null, []);

  return (
    <Modal isOpen={isOpen} onDismiss={handleDismiss}>
      <WarningContainer className="token-warning-container">
        <AutoColumn gap="lg">
          <Box display="flex" alignItems="center" width="100%" flexWrap="wrap" margin="-6px">
            <StyledWarningIcon />
            <Text fontWeight={500} fontSize={20} color={'error'}>
              Token imported
            </Text>
          </Box>
          <Text color={'error'} fontSize={16}>
            Anyone can create an ERC-20 token on Avalanche with <em>any</em> name, including creating fake versions of
            existing tokens and tokens that claim to represent projects that do not have a token.
          </Text>
          <Text color={'error'} fontSize={16}>
            This interface can load arbitrary tokens by token addresses. Please take extra caution and do your research
            when interacting with arbitrary ERC-20 tokens.
          </Text>
          <Text color={'error'} fontSize={16}>
            If you purchase an arbitrary token, <strong>you may be unable to sell it back.</strong>
          </Text>
          {tokens.map((token) => {
            return <TokenWarningCard key={token.address} token={token} />;
          })}
          <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
            <div>
              <label style={{ cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  className="understand-checkbox"
                  checked={understandChecked}
                  onChange={toggleUnderstand}
                />{' '}
                I understand
              </label>
            </div>
            <Button
              isDisabled={!understandChecked}
              variant="primary"
              width={'140px'}
              padding="0.5rem 1rem"
              onClick={() => {
                onConfirm();
              }}
            >
              Continue
            </Button>
          </Box>
        </AutoColumn>
      </WarningContainer>
    </Modal>
  );
}
