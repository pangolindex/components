import { Pair, Token, TokenAmount } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { useChainId } from 'src/hooks';
import { Box } from '../../../Box';
import WalletCard from '.';

export default {
  component: WalletCard,
  title: 'Components/Pool/WalletCard',
};

const TemplateWalletCard: ComponentStory<typeof WalletCard> = () => {
  const chainId = useChainId();
  const tokenA = new Token(43114, '0x60781C2586D68229fde47564546784ab3fACA982', 18, 'PNG', 'Pangolin');
  const tokenB = new Token(43114, '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 18, 'WAVAX', 'Wrapped AVAX');
  const tokens = [tokenA, tokenB];

  const v2Pair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId);
  return (
    <Box maxWidth="380px">
      <WalletCard pair={v2Pair} />
    </Box>
  );
};

export const Dafault = TemplateWalletCard.bind({});
