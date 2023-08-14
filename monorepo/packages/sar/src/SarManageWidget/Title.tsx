import { Box, Text, ToggleButtons } from '@pangolindex/core';
import { useTranslation } from '@pangolindex/shared';
import React from 'react';
import { Position } from 'src/hooks/types';
import { Options } from './types';

interface Props {
  selectPosition: Position | null;
  selectedOption: Options;
  onChange: (value: Options) => void;
}

export default function Title({ selectPosition, selectedOption, onChange }: Props) {
  const { t } = useTranslation();

  const renderTitle = () => {
    switch (selectedOption) {
      case Options.ADD:
        return t('sarTitle.addMore');
      case Options.UNSTAKE:
        return t('sarTitle.unstake');
      case Options.COMPOUND:
        return t('sarTitle.compound');
      case Options.CLAIM:
        return t('sarTitle.claim');
      default:
        return '';
    }
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent={selectPosition ? 'space-between' : 'start'} alignItems="center">
        <Text color="text1" fontSize="15.75px" fontWeight={700}>
          {renderTitle()}
        </Text>
        {selectPosition && (
          <Text color="text8" fontSize="10px">
            {t('sarTitle.interactingID', { id: selectPosition?.id.toString() })}
          </Text>
        )}
      </Box>
      <ToggleButtons
        options={[Options.COMPOUND, Options.ADD, Options.UNSTAKE, Options.CLAIM]}
        value={selectedOption}
        onChange={onChange}
      />
    </Box>
  );
}
