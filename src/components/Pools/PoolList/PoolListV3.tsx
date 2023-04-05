import React, { memo, useCallback, useEffect, useState } from 'react';
import { BIG_INT_ZERO } from 'src/constants';
import useDebounce from 'src/hooks/useDebounce';
import { useGetSelectedPoolId, usePoolDetailnModalToggle, useUpdateSelectedPoolId } from 'src/state/papplication/hooks';
import { usePangoChefUserExtraFarmsApr } from 'src/state/ppangoChef/hooks/common';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { MinichefStakingInfo } from 'src/state/pstake/types';
import { sortingOnAvaxStake, sortingOnStakedAmount } from 'src/state/pstake/utils';
import PoolCardV3 from '../PoolCard/PoolCardV3';
import PoolCardListView, { SortingType } from './PoolCardListView';

export interface EarnProps {
  version: string;
  stakingInfos: PangoChefInfo[];
  poolMap?: { [key: string]: number };
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
}

type StakingInfoByPid = { [pid: string]: MinichefStakingInfo };

const PoolListV3: React.FC<EarnProps> = ({ version, stakingInfos, setMenu, activeMenu, menuItems }) => {
  const [poolCardsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const [stakingInfoData, setStakingInfoData] = useState<PangoChefInfo[]>([]);
  const [stakingInfoByPid, setStakingInfoByPid] = useState<StakingInfoByPid>({});

  const togglePoolDetailModal = usePoolDetailnModalToggle();
  // we store selected Pool Id because when we create pangochef storage ( in hedera )
  // its reloading detail modal for a second so at that time we are loosing state if we have it in useState
  // so instead we are storing it in redux to make it persist
  const selectedPoolIndex = useGetSelectedPoolId();
  const updateSelectedPoolId = useUpdateSelectedPoolId();

  const extraAPRs = usePangoChefUserExtraFarmsApr(stakingInfos);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value.trim());
  }, []);

  const sort = useCallback(
    (farms: PangoChefInfo[]) => {
      if (sortBy === SortingType.totalStakedInUsd) {
        const stakedSortedFarms = [...farms]
          .filter((farm) => farm.stakedAmount.greaterThan('0'))
          .sort((a, b) => {
            const yourStackedInUsdA = a.totalStakedInUsd
              .multiply(a.stakedAmount)
              .divide(!a.totalStakedAmount.equalTo('0') ? a.totalStakedAmount : '1');
            const yourStackedInUsdB = b.totalStakedInUsd
              .multiply(b.stakedAmount)
              .divide(!b.totalStakedAmount?.equalTo('0') ? b.totalStakedAmount : '1');
            return yourStackedInUsdA.greaterThan(yourStackedInUsdB) ? -1 : 1;
          });

        const sortedFarms = [...farms]
          .filter((farm) => farm.stakedAmount.equalTo('0'))
          .sort(function (info_a, info_b) {
            return info_a.totalStakedInUsd?.greaterThan(info_b.totalStakedInUsd ?? BIG_INT_ZERO) ? -1 : 1;
          });

        setStakingInfoData([...stakedSortedFarms, ...sortedFarms]);
      } else if (sortBy === SortingType.totalApr) {
        const stakedSortedFarms = [...farms]
          .filter((farm) => farm.stakedAmount.greaterThan('0'))
          .sort((a, b) => {
            const extraAprA = extraAPRs[a.pid] ?? 0;
            const extraAprB = extraAPRs[b.pid] ?? 0;
            const aprA = a.userApr + extraAprA;
            const aprB = b.userApr + extraAprB;

            return aprB - aprA;
          });

        const sortedFarms = [...farms]
          .filter((farm) => farm.stakedAmount.equalTo('0'))
          .sort((a, b) => {
            const extraAprA = extraAPRs[a.pid] ?? 0;
            const extraAprB = extraAPRs[b.pid] ?? 0;
            const stakingAprA = a.stakingApr ?? 0;
            const stakingAprB = b.stakingApr ?? 0;

            return stakingAprB + extraAprB - (stakingAprA + extraAprA);
          });
        setStakingInfoData([...stakedSortedFarms, ...sortedFarms]);
      }
    },
    [sortBy],
  );

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
  }, [stakingInfos, debouncedSearchQuery, sortBy]);

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
      isLoading={(stakingInfoData?.length === 0 && !searchQuery) || poolCardsLoading}
      doesNotPoolExist={stakingInfoData?.length === 0 && !poolCardsLoading}
      selectedPool={selectedPool}
    >
      {stakingInfoData.map((stakingInfo) => (
        <PoolCardV3
          key={stakingInfo?.pid}
          stakingInfo={stakingInfo}
          onClickViewDetail={() => {
            updateSelectedPoolId(stakingInfo?.pid);
            togglePoolDetailModal();
          }}
          version={Number(version)}
        />
      ))}
    </PoolCardListView>
  );
};

export default memo(PoolListV3);
