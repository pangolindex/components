import React, { useContext } from 'react';
import { CheckCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Text } from 'src/components';
import { BlackBox, BlackBoxContent, CheckBox, Wrapper } from './styles';
import { FeeTierProps } from './types';

const FeeTier: React.FC<FeeTierProps> = (props) => {
  const { t } = useTranslation();
  const { selected, selectedPercentage, description, feeTierName, onSelectFeeTier } = props;
  const theme = useContext(ThemeContext);
  return (
    <Wrapper
      onClick={onSelectFeeTier}
      textAlign={'center'}
      selected={selected}
      display={'flex'}
      flexDirection={'column'}
      position={'relative'}
    >
      {selected && (
        <CheckBox>
          <CheckCircle size={14} color={theme?.primary} />
        </CheckBox>
      )}
      <Box display={'flex'}>
        <Text color={'color11'} fontSize={'14px'}>
          {feeTierName}
        </Text>
      </Box>
      <Text color={'color11'} fontSize={11} mt={'5px'}>
        {description}
      </Text>
      <BlackBox mt={'5px'}>
        <BlackBoxContent color="color11" fontSize={10} fontWeight={500}>
          {selectedPercentage}% {t('concentratedLiquidity.feeTier.selectedPercentage')}
        </BlackBoxContent>
      </BlackBox>
    </Wrapper>
  );
};

export default FeeTier;
