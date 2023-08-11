import { CAVAX } from '@pangolindex/sdk';
import { useChainId, wrappedCurrency } from '@pangolindex/shared';
import { useHederaTokenAssociated } from 'src/hooks/tokens/hedera';
import { useCurrency } from 'src/hooks/useCurrency';
import { Field } from '../atom';
import { useSwapState } from './common';

export function useHederaSwapTokenAssociated(): {
  associate: undefined | (() => Promise<void>);
  isLoading: boolean;
  hederaAssociated: boolean;
} {
  const chainId = useChainId();

  const {
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState();

  const outputCurrency = useCurrency(outputCurrencyId);
  const token = outputCurrency ? wrappedCurrency(outputCurrency, chainId) : undefined;
  const { associate, isLoading, hederaAssociated } = useHederaTokenAssociated(token?.address, token?.symbol);

  if (outputCurrency === CAVAX[chainId]) {
    return {
      associate: undefined,
      isLoading: false,
      hederaAssociated: true,
    };
  }

  return {
    associate,
    isLoading,
    hederaAssociated,
  };
}
