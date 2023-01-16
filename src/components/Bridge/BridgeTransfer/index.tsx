import { BridgeChain, BridgeCurrency } from '@pangolindex/sdk';
import React, { useContext } from 'react';
import { Info, Play, Trash } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Text, Tooltip } from 'src/components';
import { DoubleLogo } from 'src/components/DoubleLogo';
import { BridgeTransferStatus } from 'src/state/pbridge/types';
import { Buttons, Data, ResumeLayout, Row, Transfer } from './styles';
import { BridgeTransferProps } from './types';

const BridgeTransfer: React.FC<BridgeTransferProps> = (props) => {
  const keys = ['date', 'from', 'to', 'via', 'status'];
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const { status, errorMessage, index, onResume } = props;
  const generateData = (key: string) => {
    if (key === 'from' || key === 'to') {
      const chain = props[`${key.toLowerCase()}Chain`];
      const currency = props[`${key.toLowerCase()}Currency`];
      return (
        <Box display={'flex'} flexDirection={'row'}>
          <DoubleLogo
            size={24}
            margin={false}
            logo0={(chain as BridgeChain)?.logo}
            logo1={(currency as BridgeCurrency)?.logo}
          />
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
      <Row>
        {keys.map((key, index) => (
          <Data key={index}>
            <Text fontSize={[16, 14]} fontWeight={500} color={'bridge.transferKeyColor'}>
              {t(`bridge.bridgeTransfer.${key}`)}
            </Text>
            {generateData(key)}
          </Data>
        ))}
        {status === BridgeTransferStatus.PENDING && (
          <Buttons>
            <Button
              backgroundColor="bridge.secondaryBgColor"
              variant="secondary"
              width={'fit-content'}
              borderRadius={'4px'}
              padding={'7px 15px'}
              minHeight="32px"
              onClick={() => onResume?.()}
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
        {status === BridgeTransferStatus.FAILED && errorMessage && (
          <Buttons>
            <Tooltip id={`errorTooltip${index}`} effect="solid">
              {errorMessage}
            </Tooltip>
            <Button
              backgroundColor="bridge.secondaryBgColor"
              variant="secondary"
              width={'fit-content'}
              borderRadius={'4px'}
              padding={'0.25rem 0.5rem'}
              minHeight="32px"
              data-tip
              data-for={`errorTooltip${index}`}
            >
              <Info size={16} color={theme.bridge?.text} />
            </Button>
          </Buttons>
        )}
      </Row>
    </Transfer>
  );
};

export default BridgeTransfer;
