import React from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer } from 'src/components';
import Remove from '../Remove';
import { RemoveDrawerProps } from './types';

const RemoveDrawer: React.FC<RemoveDrawerProps> = (props) => {
  const { t } = useTranslation();
  const { isOpen, onClose, vault } = props;
  return (
    <Drawer title={t('common.remove')} isOpen={isOpen} onClose={onClose}>
      <Remove vault={vault} />
    </Drawer>
  );
};
export default RemoveDrawer;
