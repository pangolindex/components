import React from 'react';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import { Text } from 'src/components/Text';
import { TextInput } from 'src/components/TextInput';
import { Position } from 'src/state/psarstake/hooks';
import Title from '../Title';
import { Options } from '../types';
import { Root } from './styleds';

interface Props {
  selectedOption: Options;
  selectedPosition: Position | null;
  onChange: (value: Options) => void;
}

export default function Compound({ selectedOption, onChange }: Props) {
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
        <Text color="text1" fontSize="16px" fontWeight={500} textAlign="center">
          Rewards accrued:
        </Text>
        <Text color="text1" fontSize="36px" fontWeight={500} textAlign="center">
          255.24
        </Text>
      </Box>
      <Box display="grid" bgColor="color3" borderRadius="4px" padding="20px" style={{ gridGap: '20px' }}>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Text color="text2">Current APR</Text>
            <Text color="text1">25%</Text>
          </Box>
          <Box>
            <Text color="text2">APR After Compound</Text>
            <Text color="text1">22%</Text>
          </Box>
        </Box>
        <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
          Compound may lower your APR
        </Text>
      </Box>
      <Button variant="primary">Compound</Button>
    </Root>
  );
}
