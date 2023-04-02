import React, { useContext } from 'react';
import { CheckCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Text } from 'src/components';
import { FEE_AMOUNT_DETAIL } from './shared';
import { BlackBox, BlackBoxContent, CheckBox, Wrapper } from './styles';
import { FeeOptionProps } from './types';

const FeeOption: React.FC<FeeOptionProps> = (props) => {
  const { t } = useTranslation();
  const { feeAmount, active, poolState, distributions, onClick } = props;
  const theme = useContext(ThemeContext);
  return (
    <Wrapper
      onClick={onClick}
      textAlign={'center'}
      selected={active}
      display={'flex'}
      flexDirection={'column'}
      position={'relative'}
    >
      {active && (
        <CheckBox>
          <CheckCircle size={14} color={theme?.primary} />
        </CheckBox>
      )}
      <Box display={'flex'}>
        <Text color={'color11'} fontSize={'14px'}>
          {FEE_AMOUNT_DETAIL[feeAmount].label}%
        </Text>
      </Box>
      <Text color={'color11'} fontSize={11} mt={'5px'}>
        {FEE_AMOUNT_DETAIL[feeAmount].description}
      </Text>
      <BlackBox mt={'5px'}>
        <BlackBoxContent color="color11" fontSize={10} fontWeight={500}>
          {/* {selectedPercentage}%  */}
          {t('concentratedLiquidity.feeTier.selectedPercentage')}
        </BlackBoxContent>
      </BlackBox>
    </Wrapper>
  );
};

export default FeeOption;
