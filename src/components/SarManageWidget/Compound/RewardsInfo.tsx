import numeral from 'numeral';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'src/components/Box';
import { Text } from 'src/components/Text';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';
import { Position } from 'src/state/psarstake/hooks';
import Title from '../Title';
import { Options } from '../types';
import { ToolTipText } from './styleds';

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
          <ToolTipText color="text1" fontSize="36px" fontWeight={500} textAlign="center">
            {numeral(pendingRewards).format('0.00a')}
            <span className="tooltip">
              {pendingRewards} {png.symbol}
            </span>
          </ToolTipText>
        </Box>
      )}
    </>
  );
}
