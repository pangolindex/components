import { Box, CurrencyLogo, Text, Tooltip } from '@pangolindex/core';
import { PNG, useChainId, useTranslation } from '@pangolindex/shared';
import numeral from 'numeral';
import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { Position } from 'src/hooks/types';
import Title from '../Title';
import { Options } from '../types';

interface Props {
  selectedOption: Options;
  selectedPosition: Position | null;
  pendingRewards: string;
  onChange: (value: Options) => void;
}

export default function RewardsInfo({ selectedOption, selectedPosition, pendingRewards, onChange }: Props) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const png = PNG[chainId];

  const theme = useContext(ThemeContext);

  const formattedPedingRewards = numeral(pendingRewards).format('0.00a');

  return (
    <>
      <Title selectPosition={selectedPosition} selectedOption={selectedOption} onChange={onChange} />
      {!selectedPosition ? (
        <Box>
          <Text color="text1" fontSize="24px" fontWeight={500} textAlign="center">
            {t('sarStakeMore.choosePosition')}
          </Text>
        </Box>
      ) : (
        <Box>
          <Text color="text1" fontSize="16px" fontWeight={500} textAlign="center">
            {t('sarCompound.reward')}:
          </Text>
          <Tooltip id="pendingRewards" effect="solid" backgroundColor={theme.primary}>
            <Text color="eerieBlack" fontSize="12px" fontWeight={500} textAlign="center">
              {pendingRewards} {png.symbol}
            </Text>
          </Tooltip>
          <Text color="text1" fontSize="36px" fontWeight={500} textAlign="center" data-tip data-for="pendingRewards">
            {formattedPedingRewards === 'NaN' ? '0.00' : formattedPedingRewards}
            <CurrencyLogo currency={png} />
          </Text>
        </Box>
      )}
    </>
  );
}
