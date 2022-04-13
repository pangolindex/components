import { Token } from '@pangolindex/sdk';
import React, { HTMLProps, useCallback, useMemo, useState } from 'react';
import ReactGA from 'react-ga';
import { getEtherscanLink, shortenAddress } from 'src/utils';
import { Box, Button, CurrencyLogo, Modal, Text } from '../../';
import { useActiveWeb3React } from '../../../hooks';
import { useAllTokens } from '../../../hooks/Tokens';
import { AutoColumn, StyledLink, StyledWarningIcon, WarningContainer, Wrapper } from './styled';

interface TokenWarningCardProps {
  token?: Token;
}

/**
 * Outbound link that handles firing google analytics events
 */
function ExternalLink({
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & { href: string }) {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // don't prevent default, don't redirect if it's a new tab
      if (target === '_blank' || event.ctrlKey || event.metaKey) {
        // eslint-disable-next-line import/no-named-as-default-member
        ReactGA.outboundLink({ label: href }, () => {
          console.debug('Fired outbound link event', href);
        });
      } else {
        event.preventDefault();
        // send a ReactGA event and then trigger a location change
        // eslint-disable-next-line import/no-named-as-default-member
        ReactGA.outboundLink({ label: href }, () => {
          window.location.href = href;
        });
      }
    },
    [href, target],
  );
  return <StyledLink target={target} rel={rel} href={href} onClick={handleClick} {...rest} />;
}

function TokenWarningCard({ token }: TokenWarningCardProps) {
  const { chainId } = useActiveWeb3React();

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
          <Text fontWeight={500} fontSize={20} color={'text2'}>
            {token && token.name && token.symbol && token.name !== token.symbol
              ? `${token.name} (${token.symbol})`
              : token.name || token.symbol}{' '}
          </Text>
          {chainId && (
            <ExternalLink style={{ fontWeight: 400 }} href={getEtherscanLink(chainId, token.address, 'token')}>
              <Text fontWeight={500} color={'primary'} fontSize={16}>
                {shortenAddress(token.address)} (View on the Snowtrace Explorer)
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
            <Text fontWeight={500} fontSize={20} color={'red2'}>
              Token imported
            </Text>
          </Box>
          <Text color={'red2'} fontSize={16}>
            Anyone can create an ERC-20 token on Avalanche with <em>any</em> name, including creating fake versions of
            existing tokens and tokens that claim to represent projects that do not have a token.
          </Text>
          <Text color={'red2'} fontSize={16}>
            This interface can load arbitrary tokens by token addresses. Please take extra caution and do your research
            when interacting with arbitrary ERC-20 tokens.
          </Text>
          <Text color={'red2'} fontSize={16}>
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
