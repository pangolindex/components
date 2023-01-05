import React, { useCallback, useState } from 'react';
// import { Text, Box, useTranslation, PoolImportModal } from '@pangolindex/components'
import { useTranslation } from 'react-i18next';
import { Box, Text } from 'src/components';
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
        <Text color="color6" fontSize={14}>
          {t('pool.noSeePoolJoined')}
        </Text>

        <Text fontSize={14} color="primary" onClick={handlePoolImportModalOpen} cursor="pointer">
          {t('pool.importIt')}
        </Text>
      </Box>

      <PoolImportModal
        isOpen={isPoolImportModalOpen}
        onClose={handlePoolImportModalClose}
        onManagePoolsClick={handleManagePoolsClick}
      />
    </SidebarWrapper>
  );
};
export default Sidebar;
