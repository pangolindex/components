import React, { useContext } from 'react';
import { Play, Trash } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, DoubleCurrencyLogo, Text } from 'src/components';
import { Buttons, Data, ResumeLayout, Transfer } from './styles';
import { BridgeTransferProps } from './types';

const BridgeTransfer: React.FC<BridgeTransferProps> = (props) => {
  const keys = ['date', 'from', 'to', 'via', 'state'];
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const generateData = (key: string) => {
    if (key === 'from' || key === 'to') {
      const chain = props[`${key.toLowerCase()}Chain`];
      const coin = props[`${key.toLowerCase()}Coin`];
      return (
        <Box display={'flex'} flexDirection={'row'}>
          <DoubleCurrencyLogo margin={false} currency0={chain} currency1={coin} />
          <Text pl={'0.7rem'} fontSize={[16, 14]} fontWeight={400} color={'text1'}>
            {props[key.toLowerCase()]}
          </Text>
        </Box>
      );
    } else {
      return (
        <Text fontSize={[16, 14]} fontWeight={400} color={'text1'}>
          {props[key.toLowerCase()]}
        </Text>
      );
    }
  };

  return (
    <Transfer>
      <Box display={'flex'} flexDirection={'row'}>
        {keys.map((key, index) => (
          <Data key={index}>
            <Text fontSize={[16, 14]} fontWeight={500} color={'color9'}>
              {t(`bridge.bridgeTransfer.${key}`)}
            </Text>
            {generateData(key)}
          </Data>
        ))}
      </Box>
      <Buttons>
        <Button
          backgroundColor="color2"
          variant="secondary"
          width={'fit-content'}
          borderRadius={'4px'}
          padding={'7px 15px'}
          minHeight="32px"
        >
          <ResumeLayout>
            <Play size={18} color={theme.text1} />
            <Text fontSize={[16, 14]} fontWeight={400} color={'text1'}>
              {t('bridge.bridgeTransfer.resumeSwap')}
            </Text>
          </ResumeLayout>
        </Button>
        <Button
          backgroundColor="color2"
          variant="secondary"
          width={'fit-content'}
          borderRadius={'4px'}
          padding={'0.5rem 1rem'}
          minHeight="32px"
        >
          <Trash size={16} color={theme.text1} />
        </Button>
      </Buttons>
    </Transfer>
  );
};

export default BridgeTransfer;
