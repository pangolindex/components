import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from 'react-use';
import { ThemeContext } from 'styled-components';
import { Box } from 'src/components';
import Modal from 'src/components/Modal';
import { Tabs } from 'src/components/Tabs';
import EarnWidget from './EarnWidget';
import Header from './Header';
import IncreasePosition from './IncreasePosition';
import DetailTab from './Tabs/DetailTab';
import {
  CustomTab,
  CustomTabList,
  CustomTabPanel,
  DesktopWrapper,
  DetailsWrapper,
  LeftSection,
  MobileWrapper,
  RightSection,
  Root,
} from './styles';
import { DetailModalProps } from './types';

const DetailModal: React.FC<DetailModalProps> = (props) => {
  const { height } = useWindowSize();
  const { isOpen, currency0, currency1, onClose } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);

  const headerArgs = {
    currency0,
    currency1,
    statItems: [
      {
        title: 'Fee Rate',
        stat: '0.3%',
      },
      {
        title: 'Min Price',
        stat: `1,023.42 ${currency0?.symbol}/${currency1?.symbol}`,
      },
      {
        title: 'Max Price',
        stat: `1,023.42 ${currency0?.symbol}/${currency1?.symbol}`,
      },
      {
        title: 'Swap Fee APR',
        stat: '24%',
      },
    ],
    onClose,
  };

  const renderTabs = () => (
    <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
      <CustomTabList>
        <CustomTab>{t('votePage.details')}</CustomTab>
      </CustomTabList>
      <CustomTabPanel>
        <DetailTab />
      </CustomTabPanel>
    </Tabs>
  );

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={function (): void {
        console.log('onDismiss Function not implemented.');
      }}
      overlayBG={theme.modalBG2}
      closeOnClickOutside={true}
    >
      <>
        <MobileWrapper>
          <Header {...headerArgs} />
          <Box p={10}>
            <Box mt={'20px'}>
              <Root>
                <IncreasePosition />
              </Root>
            </Box>
            <Box mt={'20px'}>
              <Root>
                <EarnWidget />
              </Root>
            </Box>
            <Box mt={25}>{renderTabs()}</Box>
          </Box>
        </MobileWrapper>
        <DesktopWrapper style={{ maxHeight: height - 150 }}>
          <Header {...headerArgs} />
          <DetailsWrapper>
            <LeftSection>{renderTabs()}</LeftSection>
            <RightSection>
              <Root>
                <IncreasePosition />
              </Root>
              <Root>
                <EarnWidget />
              </Root>
            </RightSection>
          </DetailsWrapper>
        </DesktopWrapper>
      </>
    </Modal>
  );
};

export default DetailModal;
