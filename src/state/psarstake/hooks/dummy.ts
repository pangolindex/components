import { TokenAmount } from '@pangolindex/sdk';
import { useState } from 'react';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { ApprovalState } from 'src/hooks/useApproveCallback/constant';
import { Position } from '../types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export function useDummySarPositions(): {
  positions: Position[];
  isLoading: boolean;
} {
  return {
    positions: [] as Position[],
    isLoading: false,
  };
}

export function useDummyDerivativeSarStake(position?: Position | null) {
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

  const approveCallback = async () => {
    // This is intentional
  };

  const onStake = async () => {
    // This is intentional
  };

  const onUserInput = (_typedValue: string) => {
    setTypedValue(_typedValue);
  };

  const wrappedOnDismiss = () => {
    setTypedValue('');
  };

  const handleMax = () => {
    setStepIndex(4);
  };

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

export function useDummyDerivativeSarUnstake(position: Position | null) {
  const chainId = useChainId();
  const png = PNG[chainId];

  const [typedValue, setTypedValue] = useState('');
  const [stepIndex, setStepIndex] = useState(0);

  const attempting = false;
  const parsedAmount = new TokenAmount(png, '0');

  const error = undefined;
  const hash = null;
  const unstakeError = null;

  const onUnstake = async () => {
    // This is intentional
  };

  const onUserInput = (_typedValue: string) => {
    setTypedValue(_typedValue);
  };

  const wrappedOnDismiss = () => {
    setTypedValue('');
  };

  const handleMax = () => {
    setStepIndex(4);
  };

  const onChangePercentage = (value: number) => {
    setTypedValue('0');
  };

  return {
    attempting,
    hash,
    stepIndex,
    typedValue,
    parsedAmount,
    error,
    unstakeError,
    onUserInput,
    wrappedOnDismiss,
    handleMax,
    onUnstake,
    onChangePercentage,
    setStepIndex,
  };
}

export function useDummyDerivativeSarClaim(position: Position | null) {
  const attempting = false;
  const hash = null;
  const claimError = null;

  const wrappedOnDismiss = () => {
    // This is intentional
  };

  const onClaim = async () => {};

  return {
    attempting,
    hash,
    claimError,
    wrappedOnDismiss,
    onClaim,
  };
}

export function useDummyDerivativeSarCompound(position: Position | null) {
  const attempting = false;
  const hash = null;
  const compoundError = null;

  const wrappedOnDismiss = () => {
    // This is intentional
  };

  const onCompound = async () => {};

  return {
    attempting,
    hash,
    compoundError,
    wrappedOnDismiss,
    onCompound,
  };
}

/* eslint-enable @typescript-eslint/no-unused-vars */
