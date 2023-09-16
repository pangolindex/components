import { BIG_INT_ZERO, useChainId, useDebounce } from '@honeycomb-finance/shared';
import { usePoolDetailnModalToggle } from '@honeycomb-finance/state-hooks';
import { CHAINS } from '@pangolindex/sdk';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { MinichefStakingInfo } from 'src/hooks/minichef/types';
import { sortingOnAvaxStake, sortingOnStakedAmount } from 'src/hooks/minichef/utils';
import PoolCardV2 from '../PoolCard/PoolCardV2';
import PoolCardListView, { SortingType } from './PoolCardListView';

export interface EarnProps {
  version: string;
  stakingInfos: MinichefStakingInfo[];
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
}

type StakingInfoByPid = { [pid: string]: MinichefStakingInfo };

const PoolListV2: React.FC<EarnProps> = ({ version, stakingInfos, setMenu, activeMenu, menuItems }) => {
  const chainId = useChainId();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const [stakingInfoData, setStakingInfoData] = useState<MinichefStakingInfo[]>([]);
  const [stakingInfoByPid, setStakingInfoByPid] = useState<StakingInfoByPid>({});

  const [selectedPoolIndex, setSelectedPoolIndex] = useState('');

  const togglePoolDetailModal = usePoolDetailnModalToggle();

  const chain = CHAINS[chainId];
  const existContract = Boolean(chain.contracts!.mini_chef && chain.contracts!.mini_chef!.active);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value.trim());
  }, []);

  const sort = (farms: MinichefStakingInfo[]) => {
    if (sortBy === SortingType.totalStakedInUsd) {
      const sortedFarms = [...farms].sort(function (info_a, info_b) {
        return info_a.totalStakedInUsd?.greaterThan(info_b.totalStakedInUsd ?? BIG_INT_ZERO) ? -1 : 1;
      });
      setStakingInfoData(sortedFarms);
    } else if (sortBy === SortingType.totalApr) {
      const sortedFarms = farms
        .sort((a, b) => (b.combinedApr ?? 0) - (a.combinedApr ?? 0))
        .map((item) => farms.find((infoItem) => infoItem?.pid === item.pid) as MinichefStakingInfo)
        .filter((element) => !!element);
      setStakingInfoData(sortedFarms);
    }
  };

  useEffect(() => {
    sort(stakingInfoData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  useEffect(() => {
    if (stakingInfos?.length > 0) {
      const updatedStakingInfos = stakingInfos
        // sort by total staked
        .sort(sortingOnAvaxStake)
        .sort(sortingOnStakedAmount);

      let finalArr = updatedStakingInfos;

      // if user has searched something, then filter those results
      if (debouncedSearchQuery) {
        const filtered = stakingInfos.filter(function (stakingInfo) {
          return (
            (stakingInfo?.tokens?.[0]?.symbol || '').toUpperCase().includes(debouncedSearchQuery.toUpperCase()) ||
            (stakingInfo?.tokens?.[1]?.symbol || '').toUpperCase().includes(debouncedSearchQuery.toUpperCase())
          );
        });

        finalArr = filtered;
      }

      const finalArrByPid = finalArr.reduce((acc, info) => {
        acc[info?.pid] = info;
        return acc;
      }, {} as StakingInfoByPid);

      setStakingInfoByPid(finalArrByPid);
      setStakingInfoData(finalArr);
      sort(finalArr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakingInfos, debouncedSearchQuery]);

  const selectedPool = !!selectedPoolIndex ? stakingInfoByPid[selectedPoolIndex] : ({} as MinichefStakingInfo);

  return (
    <PoolCardListView
      version={version}
      setMenu={setMenu}
      activeMenu={activeMenu}
      menuItems={menuItems}
      handleSearch={handleSearch}
      onChangeSortBy={setSortBy}
      sortBy={sortBy}
      searchQuery={searchQuery}
      isLoading={stakingInfos?.length === 0 && !searchQuery}
      doesNotPoolExist={!existContract}
      notFoundPools={stakingInfoData?.length === 0}
      selectedPool={selectedPool}
    >
      {stakingInfoData.map((stakingInfo) => (
        <PoolCardV2
          key={stakingInfo?.pid}
          stakingInfo={stakingInfo}
          onClickViewDetail={() => {
            setSelectedPoolIndex(stakingInfo?.pid);
            togglePoolDetailModal();
          }}
          version={Number(version)}
        />
      ))}
    </PoolCardListView>
  );
};

export default memo(PoolListV2);
