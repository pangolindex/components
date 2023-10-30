import { ALL_CHAINS, Chain, ElixirVaultProvider, JSBI, Token } from '@pangolindex/sdk';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Inbox, Search } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import {
  BIG_INT_ZERO,
  Button,
  DoubleCurrencyLogo,
  DoubleSideStakingInfo,
  MinichefStakingInfo,
  unwrappedToken,
} from 'src';
import { Box, DropdownMenu, Loader, Text, TextInput } from 'src/components';
import { useChainId } from 'src/hooks';
import useDebounce from 'src/hooks/useDebounce';
import {
  useDerivedElixirVaultInfo,
  useElixirVaultActionHandlers,
  useVaultActionHandlers,
} from 'src/state/pelixirVaults/hooks';
import { ElixirVault } from 'src/state/pelixirVaults/types';
import { useMinichefStakingInfosHook } from 'src/state/pstake/hooks';
import DataTable from '../DataTable';
import { DataTableProps } from '../DataTable/types';
import DetailModal from './DetailModal';
import { DoubleLogo, ErrorContainer, LoaderWrapper, LogoImage, MobileGridContainer, Row } from './styles';
import { ElixirVaultProps } from './types';

const ElixirVaults: React.FC<ElixirVaultProps> = (props) => {
  const { t } = useTranslation();
  const chainId = useChainId();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const [detailModalIsOpen, setDetailModalIsOpen] = useState<boolean>(false);
  const [selectedVaultAddress, setSelectedVaultAddress] = useState<string | undefined>(undefined);
  const { getVaults } = useVaultActionHandlers();
  const { onChangeElixirVaultLoaderStatus, onCloseDetailModal } = useElixirVaultActionHandlers();
  const { menuItems, activeMenu, setMenu } = props;
  const [stakingInfo, setStakingInfo] = useState<DoubleSideStakingInfo | undefined>(undefined);

  const useMiniChefStakingInfos = useMinichefStakingInfosHook[chainId];
  const miniChefFarmStakingInfos = useMiniChefStakingInfos();

  const { elixirVaults, elixirVaultsLoaderStatus } = useDerivedElixirVaultInfo();
  const relatedChain: Chain = ALL_CHAINS.find((x) => x.chain_id === chainId) as Chain;
  const theme = useContext(ThemeContext);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value.trim());
  }, []);

  const onChangeDetailModalStatus = useCallback(
    (vaultAddress: string | undefined) => {
      setDetailModalIsOpen(!detailModalIsOpen);
      setSelectedVaultAddress(vaultAddress);
      onCloseDetailModal();
    },
    [detailModalIsOpen],
  );

  const handleSetMenu = useCallback(
    (value: string) => {
      setMenu && setMenu(value);
    },
    [setMenu],
  );

  useEffect(() => {
    onChangeElixirVaultLoaderStatus();
    getVaults({ chain: relatedChain });
  }, []);

  const ownMiniChefStakingInfos = useMemo(
    () =>
      (miniChefFarmStakingInfos || []).filter((stakingInfo: MinichefStakingInfo) => {
        return Boolean(
          stakingInfo.stakedAmount.greaterThan('0') ||
            stakingInfo.earnedAmount.greaterThan('0') ||
            stakingInfo.extraPendingRewards.some((pendingRewards) => JSBI.greaterThan(pendingRewards, BIG_INT_ZERO)),
        );
      }),
    [miniChefFarmStakingInfos],
  );

  const finalVaults = useMemo(() => {
    let vaults: ElixirVault[] | undefined = elixirVaults;
    if (debouncedSearchQuery && vaults) {
      vaults = vaults.filter((vault) => {
        // Initialize a variable to check if the query is found
        let queryFound = false;

        // Loop through the poolName tokens
        for (const token of vault?.poolTokens || []) {
          if (
            (token?.name || '').toUpperCase().includes(debouncedSearchQuery.toUpperCase()) ||
            (token?.symbol || '').toUpperCase().includes(debouncedSearchQuery.toUpperCase())
          ) {
            // If the query is found in either token0 or token1, set the flag to true
            queryFound = true;
            break; // No need to continue the loop
          }
        }

        // Return true if the query was found in either token0 or token1
        return queryFound;
      });
    }

    return vaults;
  }, [elixirVaults, debouncedSearchQuery]);

  const selectedVault = useMemo(() => {
    if (!finalVaults) {
      return undefined;
    } else {
      const selectedPositionExists = finalVaults.some((vault) => vault.address.toString() === selectedVaultAddress);

      if (!selectedPositionExists) {
        return undefined;
      } else {
        const newSelectedPosition = finalVaults.find((vault) => vault.address.toString() === selectedVaultAddress);

        if (newSelectedPosition) {
          setStakingInfo(
            ownMiniChefStakingInfos?.find((stakingInfo) => stakingInfo?.pairAddress === selectedVaultAddress),
          );
          return newSelectedPosition;
        }
      }
    }
  }, [finalVaults, selectedVaultAddress]);

  const poolNameRenderer = (info) => {
    const value: Token[] = info.getValue();
    const currency0 = value[0] ? unwrappedToken(value[0], chainId) : undefined;
    const currency1 = value[1] ? unwrappedToken(value[1], chainId) : undefined;
    const currencies = [currency0, currency1];
    return (
      <Row>
        <DoubleCurrencyLogo size={24} currency0={currency0} currency1={currency1} />
        {currencies?.map((token) => token?.symbol).join('-')}
      </Row>
    );
  };

  const strategyRenderer = (info) => {
    const value: ElixirVaultProvider[] = info.getValue();
    return (
      <Row>
        <DoubleLogo>
          {value.map((provider) => (
            <LogoImage key={provider.id} src={provider?.logo} />
          ))}
        </DoubleLogo>
      </Row>
    );
  };

  const ErrorDisplay = () => {
    return (
      <ErrorContainer>
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
          <Inbox size={'121px'} />
          <Text pt={'25px'} pb={'25px'} color="color11" fontSize={[18, 22]} fontWeight={400}>
            Not Found
          </Text>
        </Box>
      </ErrorContainer>
    );
  };

  const incentivizedRenderer = (info) => {
    const address: string = info.getValue();
    const isFarmExists = ownMiniChefStakingInfos?.some((stakingInfo) => stakingInfo?.pairAddress === address);
    return isFarmExists ? 'Yes' : 'No';
  };

  const columns = [
    {
      header: 'POOL NAME',
      accessorKey: 'poolTokens',
      cell: poolNameRenderer,
    },
    {
      header: 'STRATEGY PROVIDER',
      accessorKey: 'strategyProvider',
      cell: strategyRenderer,
    },
    {
      header: 'SHARE PRICE',
      accessorKey: 'sharePrice',
      // cell: (info) => info.getValue(),
      cell: (info) => info.getValue(),
      sortType: (rowA, rowB) => {
        const valueA = parseFloat(rowA.values['sharePrice'].replace('$', ''));
        const valueB = parseFloat(rowB.values['sharePrice'].replace('$', ''));
        return valueA - valueB;
      },
    },
    {
      header: 'INCENTIVIZED',
      accessorKey: 'address',
      id: 'incentivized',
      cell: incentivizedRenderer,
    },
    {
      header: 'FEES APR',
      accessorKey: 'feesApr',
      cell: (info) => info.getValue(),
    },
    {
      header: 'INCENTIVIZATION APR',
      accessorKey: 'incentivizationApr',
      dataKey: Boolean,
      cell: (info) => info.getValue(),
    },
    {
      header: '',
      accessorKey: 'address',
      cell: (info) => (
        <div>
          <Button
            onClick={() => {
              onChangeDetailModalStatus(info.getValue());
            }}
            variant={'primary'}
            height="2.3125rem"
          >
            <Text fontSize={'1rem'} fontWeight={700} fontStyle={'normal'} lineHeight={'normal'}>
              JOIN STRATEGY
            </Text>
          </Button>
        </div>
      ),
    },
  ];

  const dataArgs: DataTableProps = useMemo(() => {
    return {
      data: finalVaults,
      columns: columns,
      debugTable: true,
      styleOverrideTH:
        'font-size: 0.75rem; font-style: normal; font-weight: 700; line-height: normal; text-transform: uppercase;',
      styleOverrideTD: 'font-size: 1.125rem; font-style: normal; font-weight: 500; line-height: normal;',
    } as DataTableProps;
  }, [finalVaults]);

  return (
    <div>
      {elixirVaultsLoaderStatus ? (
        <LoaderWrapper paddingRight={'200px'}>
          <Loader height={'auto'} size={100} />
        </LoaderWrapper>
      ) : elixirVaults && elixirVaults.length > 0 ? (
        <>
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={10}>
              <Box width="100%">
                <TextInput
                  placeholder={t('elixir.positionList.searchContent')}
                  onChange={handleSearch}
                  value={searchQuery}
                  id="token-search-input"
                  addonAfter={<Search style={{ marginTop: '5px' }} color={theme.text2} size={20} />}
                />
              </Box>
            </Box>
            {menuItems && menuItems.length > 0 && activeMenu && (
              <MobileGridContainer>
                <DropdownMenu
                  options={menuItems}
                  defaultValue={activeMenu}
                  onSelect={(value) => {
                    handleSetMenu(value as string);
                  }}
                />
              </MobileGridContainer>
            )}
          </Box>
          {finalVaults && finalVaults.length > 0 ? <DataTable {...dataArgs} /> : <ErrorDisplay />}
        </>
      ) : (
        <ErrorDisplay />
      )}
      <DetailModal
        isOpen={detailModalIsOpen}
        vault={selectedVault}
        stakingInfo={stakingInfo}
        onClose={() => {
          onChangeDetailModalStatus(undefined);
          // onResetMintState();
        }}
      />
    </div>
  );
};
export default ElixirVaults;
