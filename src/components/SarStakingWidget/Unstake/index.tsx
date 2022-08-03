import React from 'react';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import { CurrencyInput } from 'src/components/CurrencyInput';
import { Text } from 'src/components/Text';
import { TextInput } from 'src/components/TextInput';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';
import { Position } from 'src/state/psarstake/hooks';
import Title from '../Title';
import { Options } from '../types';
import { Root } from './styleds';

interface Props {
  selectedOption: Options;
  selectedPosition: Position | null;
  onChange: (value: Options) => void;
}

export default function Unstake({ selectedOption, onChange }: Props) {
  const chainId = useChainId();

  const png = PNG[chainId];

  return (
    <Root>
      <Title selectedOption={selectedOption} onChange={onChange} />
      <Box>
        <Text color="text1" fontSize="18px" fontWeight={500}>
          NFT
        </Text>
        <TextInput placeholder="Choose an NFT" />
      </Box>
      <Box>
        <Box justifyContent="space-between" display="flex">
          <Text color="text1" fontSize="18px" fontWeight={500}>
            Unstake
          </Text>
          <Text color="text4">Staked 0 {png.symbol ?? 'PNG'}</Text>
        </Box>
        <CurrencyInput currency={png} isNumeric={true} placeholder="0.00" />
      </Box>
      <Box display="grid" bgColor="color3" borderRadius="4px" padding="20px" style={{ gridGap: '20px' }}>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Text color="text2">Current APR</Text>
            <Text color="text1">25%</Text>
          </Box>
          <Box>
            <Text color="text2">APR After Unstake</Text>
            <Text color="text1">0%</Text>
          </Box>
        </Box>
        <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
          When you unstake, your average APR will fall to 0.
        </Text>
      </Box>
      <Button variant="primary">Unstake</Button>
    </Root>
  );
}
