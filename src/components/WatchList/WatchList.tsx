import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import React, { useContext, useMemo, useRef, useState, useEffect } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Plus } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { Box, Button, ShowMore } from 'src/components';
import { PNG } from 'src/constants/tokens';
import { usePangolinWeb3 } from 'src/hooks';
import { useAllTokens } from 'src/hooks/Tokens';
import { useCoinGeckoTokens, CoingeckoWatchListToken } from 'src/hooks/Coingecko';
import { useOnClickOutside } from 'src/hooks/useOnClickOutside';
import useToggle from 'src/hooks/useToggle';
import { useSelectedCurrencyLists } from 'src/state/pwatchlists/hooks';
import { Hidden } from 'src/theme/components';
import CoinChart from './CoinChart';
import CurrencyPopover from './CurrencyPopover';
import WatchlistRow from './WatchlistRow';
import { DesktopWatchList, GridContainer, MobileWatchList, Title, WatchListRoot } from './styleds';

export type Props = {
  coinChartVisible?: boolean;
  visibleTradeButton?: boolean;
  tradeLinkUrl?: string;
  redirect?: boolean;
};

const WatchList: React.FC<Props> = ({
  coinChartVisible = true,
  visibleTradeButton = true,
  tradeLinkUrl,
  redirect = false,
}) => {
  const { chainId = ChainId.AVALANCHE } = usePangolinWeb3();
  const [showMore, setShowMore] = useState(false as boolean);

  const allTokens = useCoinGeckoTokens();

  console.log('==allTokens', allTokens);
  // const allTokens1 = useAllTokens();
  // console.log('==allTokens1', allTokens1);
  const coins = Object.values(allTokens || {});
  const watchListCurrencies = useSelectedCurrencyLists();
  const theme = useContext(ThemeContext);

  console.log('==1watchListCurrencies', watchListCurrencies);

  console.log('==1watchListCurrencies1', watchListCurrencies?.[0]);
  const [selectedToken, setSelectedToken] = useState(watchListCurrencies?.[0] || ({} as CoingeckoWatchListToken));
  console.log('==1selectedToken', selectedToken);
  const [open, toggle] = useToggle(false);
  const node = useRef<HTMLDivElement>();

  const popoverRef = useRef<HTMLInputElement>(null);
  const referenceElement = useRef<HTMLInputElement>(null);

  const currencies = useMemo(
    () =>
      (watchListCurrencies || []).length === 0
        ? ([coins?.[0]] as CoingeckoWatchListToken[])
        : (watchListCurrencies as CoingeckoWatchListToken[]),

    [chainId, watchListCurrencies],
  );
  useOnClickOutside(node, open ? toggle : undefined);

  useEffect(() => {
    if (Object.keys(selectedToken)?.length === 0 && watchListCurrencies && (watchListCurrencies || []).length > 0) {
      console.log('===2');
      setSelectedToken(watchListCurrencies?.[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchListCurrencies]);

  const renderWatchlistRow = (coin) => {
    return (
      <WatchlistRow
        coin={coin}
        key={coin?.id}
        onClick={() => setSelectedToken(coin)}
        onRemove={() => setSelectedToken(coins?.[0])}
        isSelected={coin?.id === selectedToken?.id}
        firstCoin={coins?.[0]}
      />
    );
  };

  const renderCoinChart = () => {
    return (
      <Hidden upToSmall={true}>
        <CoinChart
          coin={selectedToken}
          visibleTradeButton={visibleTradeButton}
          tradeLinkUrl={tradeLinkUrl}
          redirect={redirect}
        />
      </Hidden>
    );
  };

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
              onSelectCurrency={(currency: CoingeckoWatchListToken) => {
                setSelectedToken(currency);
                toggle();
              }}
            />
          )}
        </Box>
      </Box>
      <GridContainer coinChartVisible={coinChartVisible}>
        {/* render coin chart */}
        {CHAINS[chainId]?.mainnet && coinChartVisible && renderCoinChart()}
        {/* render watchlist in desktop */}
        <DesktopWatchList>
          <Scrollbars>{(currencies || []).map(renderWatchlistRow)}</Scrollbars>
        </DesktopWatchList>
        {/* render watchlist in mobile */}
        <MobileWatchList>
          {/* initially render only 3 tokens */}
          {(currencies || []).slice(0, 3).map(renderWatchlistRow)}
          {/* if user click on more, then render other tokens */}
          {showMore && (currencies || []).slice(3).map(renderWatchlistRow)}
          {/* render show more */}
          {currencies.length > 3 && <ShowMore showMore={showMore} onToggle={() => setShowMore(!showMore)} />}
        </MobileWatchList>
      </GridContainer>
    </WatchListRoot>
  );
};
export default WatchList;
