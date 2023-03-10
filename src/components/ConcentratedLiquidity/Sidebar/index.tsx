import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text } from 'src/components';
import { Circle, Link, Menu, MenuItem, MenuLink, MenuName, SidebarWrapper } from './styles';
import { SidebarProps } from './types';

const Sidebar: React.FC<SidebarProps> = (props) => {
  const { t } = useTranslation();
  const { setMenu, activeMenu, menuItems } = props;

  return (
    <SidebarWrapper>
      <Text color="color11" fontSize={[32, 28]} fontWeight={500} ml={20} mt={10}>
        {t('concentratedLiquidity.sidebar.title')}
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
        <Text color="color11" fontSize={14} mb="5px">
          {t('concentratedLiquidity.sidebar.seeMore')}
        </Text>

        <Link fontSize={14} color="primary" cursor="pointer" as="a" href="/pools">
          {t('concentratedLiquidity.sidebar.goToFarm')}
        </Link>
      </Box>
    </SidebarWrapper>
  );
};
export default Sidebar;
