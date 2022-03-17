import React from 'react';
import { Box, Text } from '../../';
import { AutoColumn, ConvertLink, StyledWarningIcon, WarningWrapper } from './styled';

export function DeprecatedWarning() {
  return (
    <WarningWrapper>
      <AutoColumn>
        <Box display="flex" alignItems="center" width="fit-content">
          <StyledWarningIcon />
          <Text fontWeight={600} ml={'10px'} color="text1">
            Old AEB tokens Alert
          </Text>
        </Box>
        <Text fontWeight={500} mt={'10px'} color="text1">
          Please note these tokens were used by the old AEB bridge and have been deprecated. If you still hold old AEB
          tokens, please convert them here{' '}
          <ConvertLink href={'https://bridge.avax.network/convert'} target="_blank">
            https://bridge.avax.network/convert
          </ConvertLink>
        </Text>
      </AutoColumn>
    </WarningWrapper>
  );
}
