import React, { useContext } from 'react';
import { Play, Trash } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, DoubleCurrencyLogo, Text } from 'src/components';
import { Buttons, Data, ResumeLayout, Transfer } from './styles';
import { BridgeState, BridgeTransferProps } from './types';

const BridgeTransfer: React.FC<BridgeTransferProps> = (props) => {
  const keys = ['date', 'from', 'to', 'via', 'state'];
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const { state } = props;
  const generateData = (key: string) => {
    if (key === 'from' || key === 'to') {
      const chain = props[`${key.toLowerCase()}Chain`];
      const coin = props[`${key.toLowerCase()}Coin`];
      return (
        <Box display={'flex'} flexDirection={'row'}>
          <DoubleCurrencyLogo margin={false} currency0={chain} currency1={coin} />
          <Text pl={'0.7rem'} fontSize={[16, 14]} fontWeight={400} color={'bridge.text'}>
            {props[key.toLowerCase()]}
          </Text>
        </Box>
      );
    } else {
      return (
        <Text fontSize={[16, 14]} fontWeight={400} color={'bridge.text'}>
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
            <Text fontSize={[16, 14]} fontWeight={500} color={'bridge.transferKeyColor'}>
              {t(`bridge.bridgeTransfer.${key}`)}
            </Text>
            {generateData(key)}
          </Data>
        ))}
      </Box>
      {state === BridgeState.PENDING && (
        <Buttons>
          <Button
            backgroundColor="bridge.secondaryBgColor"
            variant="secondary"
            width={'fit-content'}
            borderRadius={'4px'}
            padding={'7px 15px'}
            minHeight="32px"
          >
            <ResumeLayout>
              <Play size={18} color={theme.bridge?.text} />
              <Text fontSize={[16, 14]} fontWeight={400} color={'bridge.text'}>
                {t('bridge.bridgeTransfer.resumeSwap')}
              </Text>
            </ResumeLayout>
          </Button>
          <Button
            backgroundColor="bridge.secondaryBgColor"
            variant="secondary"
            width={'fit-content'}
            borderRadius={'4px'}
            padding={'0.5rem 1rem'}
            minHeight="32px"
          >
            <Trash size={16} color={theme.bridge?.text} />
          </Button>
        </Buttons>
      )}
    </Transfer>
  );
};

export default BridgeTransfer;
