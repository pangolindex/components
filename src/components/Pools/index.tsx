import { CHAINS, ChefType } from '@pangolindex/sdk';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BIG_INT_ZERO } from 'src/constants';
import { useChainId } from 'src/hooks';
import { usePangoChefInfosHook } from 'src/state/ppangoChef/multiChainsHooks';
import { useGetPangoChefInfosViaSubgraph } from 'src/state/ppangoChef/hooks';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import {
  useGetAllFarmDataHook,
  useGetMinichefStakingInfosViaSubgraphHook,
  useMinichefStakingInfosHook,
} from 'src/state/pstake/multiChainsHooks';
import { MinichefStakingInfo, PoolType } from 'src/state/pstake/types';
import { isEvmChain } from 'src/utils';
import { Box } from '../Box';
import Pool from './Pool';
import Sidebar, { MenuType } from './Sidebar';
import Wallet from './Wallet';
import { GridContainer, PageWrapper } from './styleds';

const PoolsUI = () => {
  const chainId = useChainId();
  const minichef = CHAINS[chainId].contracts?.mini_chef;

  const [activeMenu, setMenu] = useState<string>(MenuType.yourPool);

  const { t } = useTranslation();

  const useGetAllFarmData = useGetAllFarmDataHook[chainId];
  const pangoChefStakingInfos = useGetPangoChefInfosViaSubgraph();

  console.log('pangoChefStakingInfos', pangoChefStakingInfos);
  useGetAllFarmData();
  const pangoChefStakingInfos1 = usePangoChefInfosHook[chainId]() || [];

  console.log('pangoChefStakingInfos1', pangoChefStakingInfos1);

  const subgraphMiniChefStakingInfo = useGetMinichefStakingInfosViaSubgraphHook[chainId]() || [];
  const onChainMiniChefStakingInfo = useMinichefStakingInfosHook[chainId]() || [];

  // filter only live or needs migration pools
  const miniChefStakingInfo = useMemo(() => {
    if (subgraphMiniChefStakingInfo.length === 0 && onChainMiniChefStakingInfo?.length > 0) {
      return onChainMiniChefStakingInfo.filter(
        (info: any) => !info.isPeriodFinished || info.stakedAmount.greaterThan(BIG_INT_ZERO),
      ) as MinichefStakingInfo[];
    }
    return (subgraphMiniChefStakingInfo || []).filter(
      (info: MinichefStakingInfo) => !info.isPeriodFinished || info.stakedAmount.greaterThan(BIG_INT_ZERO),
    );
  }, [subgraphMiniChefStakingInfo, onChainMiniChefStakingInfo]);

  const ownminiChefStakingInfo = useMemo(
    () =>
      (miniChefStakingInfo || []).filter((stakingInfo: MinichefStakingInfo) => {
        return Boolean(stakingInfo.stakedAmount.greaterThan('0'));
      }),
    [miniChefStakingInfo],
  );

  const ownPangoCheftStakingInfo = useMemo(
    () =>
      (pangoChefStakingInfos || []).filter((stakingInfo: MinichefStakingInfo) => {
        return Boolean(stakingInfo.stakedAmount.greaterThan('0'));
      }),
    [pangoChefStakingInfos],
  );

  const minichefLength = (miniChefStakingInfo || []).length;
  const pangoChefStakingLength = (pangoChefStakingInfos || []).length;
  const superFarms = useMemo(() => {
    if (pangoChefStakingLength > 0) {
      return pangoChefStakingInfos?.filter((item: PangoChefInfo) => (item?.rewardTokensAddress?.length || 0) > 1);
    }
    return (miniChefStakingInfo || onChainMiniChefStakingInfo || []).filter(
      (item: MinichefStakingInfo) => (item?.rewardTokensAddress?.length || 0) > 1,
    );
  }, [miniChefStakingInfo, onChainMiniChefStakingInfo, pangoChefStakingInfos, pangoChefStakingLength]);

  // here if farm is not avaialble your pool menu default active
  useEffect(() => {
    if (minichefLength === 0 && pangoChefStakingLength === 0) {
      setMenu(MenuType.yourPool);
    } else if (pangoChefStakingLength > 0) {
      setMenu(MenuType.allFarm);
    } else {
      setMenu(MenuType.allFarm);
    }
  }, [minichefLength, pangoChefStakingLength]);

  const menuItems: Array<{ label: string; value: string }> = [];

  // add v2
  if (miniChefStakingInfo.length > 0) {
    menuItems.push({
      label: `${t('pool.allFarms')}`,
      value: MenuType.allFarm,
    });
  }
  if (pangoChefStakingInfos?.length > 0) {
    menuItems.push({
      label: `${t('pool.allFarms')}`,
      value: MenuType.allFarm,
    });
  }

  // add own v2
  if (ownminiChefStakingInfo.length > 0) {
    menuItems.push({
      label: `${t('pool.yourFarms')}`,
      value: MenuType.yourFarm,
    });
  }
  // add own pangochef
  if (ownPangoCheftStakingInfo.length > 0) {
    menuItems.push({
      label: `${t('pool.yourFarms')}`,
      value: MenuType.yourFarm,
    });
  }
  // add superfarm
  if (superFarms.length > 0) {
    menuItems.push({
      label: 'Super Farms',
      value: MenuType.superFarm,
    });
  }
  // TODO remove comment
  // if (menuItems.length > 0) {
  // add wallet
  menuItems.push({
    label: `${t('pool.yourPools')}`,
    value: MenuType.yourPool,
  });
  //}

  const handleSetMenu = useCallback(
    (value: string) => {
      setMenu(value);
    },
    [setMenu],
  );

  const getVersion = () => {
    const chefType = minichef?.type;
    switch (chefType) {
      case ChefType.MINI_CHEF:
        return 1;
      case ChefType.MINI_CHEF_V2:
        return 2;
      case ChefType.PANGO_CHEF:
        return 3;
      default:
        return 2;
    }
  };

  const version = getVersion();

  return (
    <PageWrapper>
      <GridContainer>
        <Box display="flex" height="100%">
          <Sidebar
            activeMenu={activeMenu}
            setMenu={handleSetMenu}
            menuItems={menuItems}
            onManagePoolsClick={() => {
              setMenu(MenuType.yourPool);
            }}
          />

          {(activeMenu === MenuType.allFarm || activeMenu === MenuType.yourFarm || activeMenu === MenuType.superFarm) &&
            isEvmChain(chainId) && (
              <Pool
                type={
                  activeMenu === MenuType.allFarm
                    ? PoolType.all
                    : activeMenu === MenuType.superFarm
                    ? PoolType.superFarms
                    : PoolType.own
                }
                version={version}
                stakingInfoV1={[]}
                miniChefStakingInfo={miniChefStakingInfo}
                pangoChefStakingInfo={pangoChefStakingInfos}
                activeMenu={activeMenu}
                setMenu={handleSetMenu}
                menuItems={menuItems}
              />
            )}
          {activeMenu === MenuType.yourPool && (
            <Wallet activeMenu={activeMenu} setMenu={handleSetMenu} menuItems={menuItems} />
          )}
        </Box>
      </GridContainer>
    </PageWrapper>
  );
};
export default PoolsUI;
