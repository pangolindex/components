import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text } from 'src/components';
import useParsedQueryString from 'src/hooks/useParsedQueryString';
import AddLiquidityModal from '../AddLiquidityModal';
import PoolImportModal from '../PoolImportModal';
import { Circle, Menu, MenuItem, MenuLink, MenuName, SidebarWrapper } from './styleds';

export enum MenuType {
  allFarm = 'allFarm',
  yourFarm = 'yourFarm',
  superFarm = 'superFarm',
  yourPool = 'your-pool',
}

interface MenuProps {
  setMenu: (value: string) => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
  onManagePoolsClick: () => void;
}

const Sidebar = ({ setMenu, activeMenu, menuItems, onManagePoolsClick }: MenuProps) => {
  const { t } = useTranslation();
  const [isPoolImportModalOpen, setIsPoolImportModalOpen] = useState(false);
  const [isAddLiquidityModalOpen, setAddLiquidityModalOpen] = useState<boolean>(false);

  const parsedQs = useParsedQueryString();

  const handlePoolImportModalClose = useCallback(() => {
    setIsPoolImportModalOpen(false);
  }, [setIsPoolImportModalOpen]);

  const handlePoolImportModalOpen = useCallback(() => {
    setIsPoolImportModalOpen(true);
  }, [setIsPoolImportModalOpen]);

  const handleManagePoolsClick = useCallback(() => {
    setIsPoolImportModalOpen(false);
    onManagePoolsClick();
  }, [setIsPoolImportModalOpen, onManagePoolsClick]);

  const handleAddLiquidityModalClose = useCallback(() => {
    setAddLiquidityModalOpen(false);
  }, [setAddLiquidityModalOpen]);

  const currency0 = parsedQs?.currency0;
  const currency1 = parsedQs?.currency1;

  useEffect(() => {
    if (currency0 && currency1) {
      setAddLiquidityModalOpen(true);
    }
  }, [currency0, currency1]);
  return (
    <SidebarWrapper>
      <Text color="text1" fontSize={[32, 28]} fontWeight={500} ml={20} mt={10}>
        {t('header.pool')}
      </Text>

      <Menu>
        {menuItems.map((x, index) => {
          return (
            <MenuItem isActive={x.value === activeMenu} key={index}>
              <MenuLink isActive={x.value === activeMenu} id={x.value} onClick={() => setMenu(x.value)} key={index}>
                {x.value === activeMenu && <Circle />}
                <MenuName fontSize={16}>{x.label}</MenuName>
              </MenuLink>
            </MenuItem>
          );
        })}
      </Menu>

      <Box padding="8px" mb={10} ml="12px">
        <Text fontSize={14} color="primary" onClick={() => setAddLiquidityModalOpen(true)} cursor="pointer">
          {t('navigationTabs.createPair')}
        </Text>
      </Box>

      <Box padding="8px" mb={10} ml="12px">
        <Text color="color6" fontSize={14} mb="5px">
          {t('pool.noSeePoolJoined')}
        </Text>

        <Text fontSize={14} color="primary" onClick={handlePoolImportModalOpen} cursor="pointer">
          {t('pool.importIt')}
        </Text>
      </Box>
      <AddLiquidityModal isOpen={isAddLiquidityModalOpen} onClose={handleAddLiquidityModalClose} />
      <PoolImportModal
        isOpen={isPoolImportModalOpen}
        onClose={handlePoolImportModalClose}
        onManagePoolsClick={handleManagePoolsClick}
      />
    </SidebarWrapper>
  );
};
export default Sidebar;
