import React from 'react';
import { Text } from '../Text';
import { ToggleButtons } from '../ToggleButtons';
import { Options } from './types';

interface Props {
  selectedOption: Options;
  onChange: (value: Options) => void;
}

export default function Title({ selectedOption, onChange }: Props) {
  return (
    <>
      <Text color="text1" fontSize="28px" fontWeight={700}>
        Sunshine
      </Text>
      <ToggleButtons
        options={[Options.COUMPOUND, Options.STAKE, Options.UNSTAKE, Options.CLAIM]}
        value={selectedOption}
        onChange={onChange}
      />
    </>
  );
}
