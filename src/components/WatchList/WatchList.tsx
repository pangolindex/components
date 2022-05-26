import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import React, { useContext, useMemo, useRef, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Plus } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { Box, Button, ShowMore } from 'src/components';
import { PNG } from 'src/constants/tokens';
import { useActiveWeb3React } from 'src/hooks';
import { useAllTokens } from 'src/hooks/Tokens';
import { useOnClickOutside } from 'src/hooks/useOnClickOutside';
import useToggle from 'src/hooks/useToggle';
import { useSelectedCurrencyLists } from 'src/state/pwatchlists/hooks';
import { Hidden } from 'src/theme/components';
import CoinChart from './CoinChart';
import CurrencyPopover from './CurrencyPopover';
import WatchlistRow from './WatchlistRow';
import { DesktopWatchList, GridContainer, MobileWatchList, Title, WatchListRoot } from './styleds';

export type Props = {
  isLimitOrders?: boolean;
  visibleTradeButton?: boolean;
  tradeLinkUrl?: string;
  redirect?: boolean;
};

const WatchList: React.FC<Props> = ({ isLimitOrders, visibleTradeButton = true, tradeLinkUrl, redirect = false }) => {
  const { chainId = ChainId.AVALANCHE } = useActiveWeb3React();
  const [showMore, setShowMore] = useState(false as boolean);
  const allTokens = useAllTokens();

  const coins = Object.values(allTokens || {});
  const watchListCurrencies = useSelectedCurrencyLists();
  const theme = useContext(ThemeContext);
  const [selectedToken, setSelectedToken] = useState(watchListCurrencies?.[0] || ({} as Token));

  const [open, toggle] = useToggle(false);
  const node = useRef<HTMLDivElement>();

  const popoverRef = useRef<HTMLInputElement>(null);
  const referenceElement = useRef<HTMLInputElement>(null);

  const currencies = useMemo(
    () => ((watchListCurrencies || []).length === 0 ? ([PNG[chainId]] as Token[]) : (watchListCurrencies as Token[])),

    [chainId, watchListCurrencies],
  );
  useOnClickOutside(node, open ? toggle : undefined);
  return (
    <WatchListRoot>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Title>Watchlist</Title>
        <Box bgColor={theme.bg5 as any} position="relative" p={'5px'} ref={node as any}>
          <Box ref={referenceElement} onClick={toggle}>
            <Button
              variant="primary"
              backgroundColor="primary"
              color="white"
              width={'32px'}
              height={'32px'}
              padding="0px"
            >
              <Plus size={12} color={'black'} />
            </Button>
          </Box>

          {open && (
            <CurrencyPopover
              getRef={(ref: HTMLInputElement) => ((popoverRef as any).current = ref)}
              coins={coins}
              isOpen={open}
              onSelectCurrency={(currency: Token) => {
                setSelectedToken(currency);
                toggle();
              }}
            />
          )}
        </Box>
      </Box>
      <GridContainer isLimitOrders={isLimitOrders}>
        {CHAINS[chainId].mainnet
          ? !isLimitOrders && (
              <Hidden upToSmall={true}>
                <CoinChart
                  coin={selectedToken}
                  visibleTradeButton={visibleTradeButton}
                  tradeLinkUrl={tradeLinkUrl}
                  redirect={redirect}
                />
              </Hidden>
            )
          : isLimitOrders && (
              <Hidden upToSmall={true}>
                <CoinChart
                  coin={selectedToken}
                  visibleTradeButton={visibleTradeButton}
                  tradeLinkUrl={tradeLinkUrl}
                  redirect={redirect}
                />
              </Hidden>
            )}

        <DesktopWatchList>
          <Scrollbars>
            {(currencies || []).map((coin) => (
              <WatchlistRow
                coin={coin}
                key={coin.address}
                onClick={() => setSelectedToken(coin)}
                onRemove={() => setSelectedToken(PNG[chainId])}
                isSelected={coin?.address === selectedToken?.address}
              />
            ))}
          </Scrollbars>
        </DesktopWatchList>
        <MobileWatchList>
          {(currencies || []).slice(0, 3).map((coin) => (
            <WatchlistRow
              coin={coin}
              key={coin.address}
              onClick={() => setSelectedToken(coin)}
              onRemove={() => setSelectedToken(PNG[chainId])}
              isSelected={coin?.address === selectedToken?.address}
            />
          ))}

          {showMore &&
            (currencies || [])
              .slice(3)
              .map((coin) => (
                <WatchlistRow
                  coin={coin}
                  key={coin.address}
                  onClick={() => setSelectedToken(coin)}
                  onRemove={() => setSelectedToken(PNG[chainId])}
                  isSelected={coin?.address === selectedToken?.address}
                />
              ))}

          {currencies.length > 3 && <ShowMore showMore={showMore} onToggle={() => setShowMore(!showMore)} />}
        </MobileWatchList>
      </GridContainer>
    </WatchListRoot>
  );
};
export default WatchList;
