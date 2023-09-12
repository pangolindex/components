import { Box, Text } from '@honeycomb/core';
import React from 'react';
import { WarningWrapper } from './styles';
import { OutofRangeWarningProps } from './types';

const OutofRangeWarning: React.FC<OutofRangeWarningProps> = (props) => {
  const { label, labelColor, addonLabel, message } = props;

  return (
    <Box>
      <Box display="flex" justifyContent={label ? 'space-between' : 'flex-end'}>
        {label && <Text color={labelColor || 'textInput.labelText'}>{label}</Text>}
        {addonLabel ? addonLabel : null}
      </Box>
      <WarningWrapper>
        <Text fontSize={14} textAlign="left" color="text1">
          {message}
        </Text>
      </WarningWrapper>
    </Box>
  );
};

export default OutofRangeWarning;
