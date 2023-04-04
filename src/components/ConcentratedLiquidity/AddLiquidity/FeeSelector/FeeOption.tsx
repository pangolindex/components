import React, { useContext } from 'react';
import { CheckCircle } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { Box, Text } from 'src/components';
import { FeeTierPercentageBadge } from './FeeTierPercentageBadge';
import { FEE_AMOUNT_DETAIL } from './shared';
import { CheckBox, Wrapper } from './styles';
import { FeeOptionProps } from './types';

const FeeOption: React.FC<FeeOptionProps> = (props) => {
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

      {distributions && (
        <FeeTierPercentageBadge distributions={distributions} feeAmount={feeAmount} poolState={poolState} />
      )}
    </Wrapper>
  );
};

export default FeeOption;
