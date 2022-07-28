import React from 'react';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import { CurrencyInput } from 'src/components/CurrencyInput';
import { Text } from 'src/components/Text';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useTokenBalances } from 'src/state/pwallet/hooks';
import Title from '../Title';
import { Options } from '../types';
import { Root } from './styleds';

interface Props {
  selected: Options;
  onChange: (value: Options) => void;
}

export default function Stake({ selected, onChange }: Props) {
  const chainId = useChainId();
  const { account } = usePangolinWeb3();

  const png = PNG[chainId];

  const tokensBalances = useTokenBalances(account ?? '', [png]);

  const amount = tokensBalances[png.address];

  return (
    <Root>
      <Title selectedOption={selected} onChange={onChange} />
      <Box>
        <Box justifyContent="space-between" display="flex">
          <Text color="text1" fontSize="18px" fontWeight={500}>
            Stake
          </Text>
          <Text color="text4">
            In Wallet {amount?.toSignificant(2) ?? 0} {png.symbol ?? 'PNG'}
          </Text>
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
            <Text color="text2">APR After Stake</Text>
            <Text color="text1">22%</Text>
          </Box>
        </Box>
        <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
          Restake may lower your current APR.
        </Text>
      </Box>
      <Button variant="primary">Stake</Button>
    </Root>
  );
}
