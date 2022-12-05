import { TokenAmount } from '@pangolindex/sdk';
import { useState } from 'react';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { ApprovalState } from 'src/hooks/useApproveCallback';
import { Position } from './types';

export function useDummySarPositions(): {
  positions: Position[];
  isLoading: boolean;
} {
  return {
    positions: [] as Position[],
    isLoading: false,
  };
}

export function useDummyDerivativeSarStake() {
  const chainId = useChainId();
  const { account } = usePangolinWeb3();

  const png = PNG[chainId];

  const [typedValue, setTypedValue] = useState('');
  const [stepIndex, setStepIndex] = useState(0);

  const attempting = false;
  const parsedAmount = new TokenAmount(png, '0');

  const error = undefined;
  const hash = null;
  const stakeError = null;
  const dollerWorth = 0;

  const approval = ApprovalState.UNKNOWN;

  const approveCallback = async () => {};

  const onStake = async () => {};

  const onUserInput = (_typedValue: string) => {
    setTypedValue(_typedValue);
  };

  const wrappedOnDismiss = () => {
    setTypedValue('');
  };

  const handleMax = () => {
    setStepIndex(4);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onChangePercentage = (value: number) => {
    setTypedValue('0');
  };

  return {
    attempting,
    typedValue,
    parsedAmount,
    hash,
    stepIndex,
    dollerWorth,
    error,
    approval,
    account,
    png,
    stakeError,
    onAttemptToApprove: approveCallback,
    onUserInput,
    wrappedOnDismiss,
    handleMax,
    onStake,
    onChangePercentage,
    setStepIndex,
  };
}
