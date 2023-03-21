import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, DoubleCurrencyLogo, Text } from 'src/components';
import {
  BlackBox,
  BlackBoxContent,
  Card,
  Data,
  DesktopWrapper,
  HoverWrapper,
  MobileWrapper,
  OptionButton,
  OptionsWrapper,
  Panel,
  Price,
  Row,
} from './styles';
import { PositionCardProps } from './types';

const PositionCard: React.FC<PositionCardProps> = (props) => {
  const { currency0, currency1, onClick } = props;
  const { t } = useTranslation();
  return (
    <>
      <DesktopWrapper>
        <HoverWrapper>
          <Card onClick={onClick}>
            <Row>
              <Data>
                <DoubleCurrencyLogo size={48} currency0={currency0} currency1={currency1} />
                <Text color="color11" fontSize={28} fontWeight={700}>
                  {currency0.symbol}-{currency1.symbol}
                </Text>
                <BlackBox>
                  <BlackBoxContent color="color11" fontSize={18} fontWeight={500}>
                    %0.1
                  </BlackBoxContent>
                </BlackBox>
                <BlackBox>
                  <BlackBoxContent color="color11" fontSize={18} fontWeight={500}>
                    {t('common.open')}
                  </BlackBoxContent>
                </BlackBox>
              </Data>
              <Price>
                <Box display={'flex'} flexDirection="column" alignItems={'flex-end'}>
                  <Box display={'flex'}>
                    <Text color="primary" fontSize={18} fontWeight={500}>
                      {t('common.min')}:&nbsp;
                    </Text>
                    <Text color="color11" fontSize={18} fontWeight={500}>
                      362.00 {currency0.symbol} per {currency1.symbol}
                    </Text>
                  </Box>
                  <Box display={'flex'}>
                    <Text color="primary" fontSize={18} fontWeight={500}>
                      {t('common.max')}:&nbsp;
                    </Text>
                    <Text color="color11" fontSize={18} fontWeight={500}>
                      1,889.54 {currency0.symbol} per {currency1.symbol}
                    </Text>
                  </Box>
                </Box>
              </Price>
            </Row>
          </Card>
        </HoverWrapper>
      </DesktopWrapper>
      <MobileWrapper>
        <Panel>
          <Box display="flex" alignItems="center" justifyContent="space-between" pb={'20px'}>
            <Box>
              <Text fontSize={24} fontWeight={500} color={'color11'}>
                {currency0.symbol}-{currency1.symbol}
              </Text>

              <Box pt={'10px'} display={'flex'} flexDirection={'row'}>
                <OptionsWrapper>
                  <OptionButton>
                    <Text>%0.1</Text>
                  </OptionButton>
                  <BlackBox>
                    <Text p={'2px 6px'} textAlign={'center'} color={'color11'}>
                      {t('common.open')}
                    </Text>
                  </BlackBox>
                </OptionsWrapper>
              </Box>
            </Box>

            <DoubleCurrencyLogo size={48} currency0={currency0} currency1={currency1} />
          </Box>

          <Price>
            <Box display={'flex'} flexDirection="column">
              <Text color="primary" fontSize={18} fontWeight={500}>
                {t('common.min')}:&nbsp;
              </Text>
              <Text color="color11" fontSize={18} fontWeight={500}>
                362.00 {currency0.symbol}/{currency1.symbol}
              </Text>
            </Box>
            <Box display={'flex'} flexDirection="column">
              <Text color="primary" fontSize={18} fontWeight={500}>
                {t('common.max')}:&nbsp;
              </Text>
              <Text color="color11" fontSize={18} fontWeight={500}>
                1,889.54 {currency0.symbol}/{currency1.symbol}
              </Text>
            </Box>
          </Price>
          <Box pt={'15px'}>
            <Button height="46px" variant="primary" borderRadius="4px" onClick={onClick}>
              SEE DETAILS
            </Button>
          </Box>
        </Panel>
      </MobileWrapper>
    </>
  );
};

export default PositionCard;
