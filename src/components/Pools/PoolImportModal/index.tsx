import { CAVAX, Currency } from '@pangolindex/sdk';
import React, { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Modal, Text } from 'src/components';
import SelectTokenDrawer from 'src/components/SwapWidget/SelectTokenDrawer';
import { useChainId } from 'src/hooks';
import { CloseIcon } from 'src/theme/components';
import PoolImport from './PoolImport';
import { Wrapper } from './styleds';

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

export interface ImportPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManagePoolsClick: () => void;
}

const PoolImportModal = ({ isOpen, onClose, onManagePoolsClick }: ImportPoolModalProps) => {
  const theme = useContext(ThemeContext);
  const chainId = useChainId();

  const { t } = useTranslation();
  const [currency0, setCurrency0] = useState<Currency | undefined>(CAVAX[chainId]);
  const [currency1, setCurrency1] = useState<Currency | undefined>(undefined);
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1);
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency);
      } else {
        setCurrency1(currency);
      }
    },
    [activeField],
  );

  const handleSearchDismiss = useCallback(() => {
    setShowSearch(false);
  }, [setShowSearch]);

  return (
    <Modal isOpen={isOpen} onDismiss={onClose} overlayBG={theme.modalBG2} closeOnClickOutside={false}>
      <Wrapper>
        <Box p={10} display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Text color="text1" fontSize={[24, 18]} fontWeight={500}>
            {t('navigationTabs.importPool')}
          </Text>
          <CloseIcon onClick={onClose} color={theme.text1} />
        </Box>
        <PoolImport
          onClose={onClose}
          currency0={currency0}
          currency1={currency1}
          openTokenDrawer={() => setShowSearch(true)}
          setActiveField={setActiveField}
          onManagePoolsClick={onManagePoolsClick}
        />

        <SelectTokenDrawer
          isOpen={showSearch}
          onClose={handleSearchDismiss}
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={activeField === Fields.TOKEN0 ? currency0 : currency1}
          otherSelectedCurrency={activeField === Fields.TOKEN0 ? currency1 : currency0}
        />
      </Wrapper>
    </Modal>
  );
};
export default PoolImportModal;
