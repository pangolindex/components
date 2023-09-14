import { Box, Button, Hidden, ShowMore } from '@honeycomb-finance/core';
import { useOnClickOutside, useTranslation } from '@honeycomb-finance/shared';
import { CoingeckoWatchListToken, useCoinGeckoTokens } from '@honeycomb-finance/state-hooks';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Plus } from 'react-feather';
import { useToggle } from 'react-use';
import { ThemeContext } from 'styled-components';
import { useSelectedCurrencyLists } from 'src/hooks';
import CoinChart from './CoinChart';
import CurrencyPopover from './CurrencyPopover';
import WatchlistRow from './WatchlistRow';
import { DesktopWatchList, GridContainer, MobileWatchList, NoDataWrapper, Title, WatchListRoot } from './styleds';

export type Props = {
  coinChartVisible?: boolean;
};

const WatchList: React.FC<Props> = ({ coinChartVisible = true }) => {
  const [showMore, setShowMore] = useState(false as boolean);

  const allTokens = useCoinGeckoTokens();
  const { t } = useTranslation();
  const selectedCurrencies = useSelectedCurrencyLists();
  const theme = useContext(ThemeContext);

  const [selectedToken, setSelectedToken] = useState({} as CoingeckoWatchListToken);

  const [open, toggle] = useToggle(false);
  const node = useRef<HTMLDivElement>();

  const popoverRef = useRef<HTMLInputElement>(null);
  const referenceElement = useRef<HTMLInputElement>(null);

  useOnClickOutside(node, open ? toggle : undefined);

  useEffect(() => {
    if (selectedCurrencies && Object.keys(selectedToken)?.length === 0 && (selectedCurrencies || []).length > 0) {
      setSelectedToken(selectedCurrencies?.[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCurrencies]);

  const renderWatchlistRow = (coin) => {
    return (
      <WatchlistRow
        coin={coin}
        key={`${coin?.id}-${coin?.symbol}`}
        onClick={() => setSelectedToken(coin)}
        isSelected={coin?.id === selectedToken?.id}
        totalLength={(selectedCurrencies || []).length}
      />
    );
  };

  const renderCoinChart = () => {
    return (
      <Hidden upToSmall={true}>
        <CoinChart coin={selectedToken} />
      </Hidden>
    );
  };

  const renderWatchListData = () => {
    if ((selectedCurrencies || []).length > 0) {
      return (
        <GridContainer coinChartVisible={coinChartVisible}>
          {/* render coin chart */}
          {coinChartVisible && renderCoinChart()}
          {/* render watchlist in desktop */}
          <DesktopWatchList>
            <Scrollbars>{(selectedCurrencies || []).map(renderWatchlistRow)}</Scrollbars>
          </DesktopWatchList>
          {/* render watchlist in mobile */}
          <MobileWatchList>
            {/* initially render only 3 tokens */}
            {(selectedCurrencies || []).slice(0, 3).map(renderWatchlistRow)}
            {/* if user click on more, then render other tokens */}
            {showMore && (selectedCurrencies || []).slice(3).map(renderWatchlistRow)}
            {/* render show more */}
            {(selectedCurrencies || []).length > 3 && (
              <ShowMore showMore={showMore} onToggle={() => setShowMore(!showMore)} />
            )}
          </MobileWatchList>
        </GridContainer>
      );
    } else {
      return (
        <NoDataWrapper>
          {t('common.noDataAvailable')}
          <Box display="flex" alignItems="center" color="text1" justifyContent="center" flexWrap="wrap" mt={2}>
            {t('swapPage.addTokenWatchlist')}{' '}
            <Box mx={2}>
              <Button
                variant="primary"
                backgroundColor="primary"
                color="white"
                width={'32px'}
                height={'32px'}
                padding="0px"
                isDisabled
              >
                <Plus size={12} color={'black'} />
              </Button>
            </Box>
            button!
          </Box>
        </NoDataWrapper>
      );
    }
  };

  return (
    <WatchListRoot>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Title>{t('swapPage.watchList')}</Title>
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
              coins={allTokens}
              isOpen={open}
              onSelectCurrency={(currency: CoingeckoWatchListToken) => {
                setSelectedToken(currency);
                toggle();
              }}
            />
          )}
        </Box>
      </Box>
      {renderWatchListData()}
    </WatchListRoot>
  );
};
export default WatchList;
