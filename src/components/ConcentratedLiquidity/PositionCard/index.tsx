import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, DoubleCurrencyLogo, Text } from 'src/components';
import { BlackBox, BlackBoxContent, Card, Data, Price, Row } from './styles';
import { PositionCardProps } from './types';

const PositionCard: React.FC<PositionCardProps> = (props) => {
  const { currency0, currency1 } = props;
  const { t } = useTranslation();

  return (
    <Card>
      <Row>
        <Data>
          <DoubleCurrencyLogo size={48} currency0={currency0} currency1={currency1} />
          <Text color="text1" fontSize={28} fontWeight={700}>
            {currency0.symbol}-{currency1.symbol}
          </Text>
          <BlackBox>
            <BlackBoxContent color="text1" fontSize={18} fontWeight={500}>
              %0.1
            </BlackBoxContent>
          </BlackBox>
          <BlackBox>
            <BlackBoxContent color="text1" fontSize={18} fontWeight={500}>
              {t('concentratedLiquidity.positionCard.open')}
            </BlackBoxContent>
          </BlackBox>
        </Data>
        <Price>
          <Box display={'flex'} flexDirection="column" alignItems={'flex-end'}>
            <Box display={'flex'}>
              <Text color="primary" fontSize={18} fontWeight={500}>
                {t('concentratedLiquidity.positionCard.min')}:&nbsp;
              </Text>
              <Text color="text1" fontSize={18} fontWeight={500}>
                362.00 {currency0.symbol} per {currency1.symbol}
              </Text>
            </Box>
            <Box display={'flex'}>
              <Text color="primary" fontSize={18} fontWeight={500}>
                {t('concentratedLiquidity.positionCard.max')}:&nbsp;
              </Text>
              <Text color="text1" fontSize={18} fontWeight={500}>
                1,889.54 {currency0.symbol} per {currency1.symbol}
              </Text>
            </Box>
          </Box>
        </Price>
      </Row>
    </Card>
  );
};

export default PositionCard;
