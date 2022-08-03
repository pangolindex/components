import React from 'react';
import { Text } from '../Text';
import { ToggleButtons } from '../ToggleButtons';
import { Options } from './types';

interface Props {
  selectedOption: Options;
  onChange: (value: Options) => void;
}

export default function Title({ selectedOption, onChange }: Props) {
  const renderTitle = () => {
    switch (selectedOption) {
      case Options.ADD:
        return 'ADD MORE';
      case Options.UNSTAKE:
        return 'UNSTAKE A POSITION';
      case Options.COUMPOUND:
        return 'COUMPOUND REWARDS';
      case Options.CLAIM:
        return 'CLAIM REWARDS';
      default:
        return '';
    }
  };

  return (
    <>
      <Text color="text1" fontSize="21px" fontWeight={700}>
        {renderTitle()}
      </Text>
      <ToggleButtons
        options={[Options.COUMPOUND, Options.ADD, Options.UNSTAKE, Options.CLAIM]}
        value={selectedOption}
        onChange={onChange}
      />
    </>
  );
}
