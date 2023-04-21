import { Token } from '@pangolindex/sdk';
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
  const { isOpen, position, onClose } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);

  const headerArgs = {
    token0: position?.token0 as Token,
    token1: position?.token1 as Token,
    statItems: [
      {
        title: 'Fee Rate',
        stat: `${position && position.fee / 10 ** 4}%`,
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
        <DetailTab position={position} />
      </CustomTabPanel>
    </Tabs>
  );

  return (
    <Modal isOpen={isOpen} onDismiss={onClose} overlayBG={theme.modalBG2} closeOnClickOutside={true}>
      <>
        <MobileWrapper>
          <Header {...headerArgs} />
          <Box p={10}>
            <Box mt={'20px'}>
              <Root>
                <IncreasePosition />
              </Root>
            </Box>
            {position && !position.liquidity.isZero() && (
              <Box mt={'20px'}>
                <Root>
                  <EarnWidget position={position} />
                </Root>
              </Box>
            )}
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
              {position && !position.liquidity.isZero() && (
                <Root verticalPadding={'35px'}>
                  <EarnWidget position={position} />
                </Root>
              )}
            </RightSection>
          </DetailsWrapper>
        </DesktopWrapper>
      </>
    </Modal>
  );
};

export default DetailModal;
