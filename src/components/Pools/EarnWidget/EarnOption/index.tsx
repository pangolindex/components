import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, ToggleButtons } from 'src/components';
import { EarnWrapper } from './styled';

interface Props {
  type: string;
  setType: (value: string) => void;
}

export enum TradeType {
  Pool = 'Pool',
  Farm = 'Farm',
}

const TradeOption: React.FC<Props> = ({ type, setType }) => {
  const { t } = useTranslation();
  return (
    <EarnWrapper>
      <Box p={20}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Text
            color="text1"
            fontSize={[20, 16]}
            fontWeight={500}
            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {type === 'Pool' ? t('pool.addLiquidity') : t('header.farm')}
          </Text>
          <Box width="120px">
            <ToggleButtons
              options={[TradeType.Pool, TradeType.Farm]}
              value={type}
              onChange={(value) => {
                setType(value);
              }}
            />
          </Box>
        </Box>
      </Box>
    </EarnWrapper>
  );
};
export default TradeOption;
