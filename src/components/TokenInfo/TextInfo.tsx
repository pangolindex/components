import _uniqueId from 'lodash/uniqueId';
import React, { useContext, useState } from 'react';
import { ThemeContext } from 'styled-components';
import { Box, Tooltip } from 'src/components';
import Text from '../Text/Text';

export interface Props {
  text: string;
  value: string;
  tooltipText?: string;
}

export const TextInfo: React.FC<Props> = ({ text, value, tooltipText }) => {
  const [id] = useState(_uniqueId('tip-'));
  const theme = useContext(ThemeContext);

  return (
    <Box display="flex" justifyContent="space-between" width="100%">
      <Text color="text1" fontWeight={500}>
        {text}
      </Text>
      <Text color="text1" fontWeight={500} data-tip data-for={id}>
        {value}
      </Text>
      {tooltipText && (
        <Tooltip id={id} effect="solid" backgroundColor={theme.primary}>
          <Text color="eerieBlack" fontSize="12px" fontWeight={500} textAlign="center">
            {tooltipText}
          </Text>
        </Tooltip>
      )}
    </Box>
  );
};
