import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, NumberOptions, Text, TextInput } from '../../';
import { InputOptions } from './styled';

export interface SlippageInputProps {
  expertMode?: boolean;
  slippageTolerance: string;
  showTitle?: boolean;
  setSlippageTolerance: React.Dispatch<React.SetStateAction<string>>;
}

const SlippageInput: React.FC<SlippageInputProps> = ({
  expertMode = false,
  slippageTolerance,
  showTitle = true,
  setSlippageTolerance,
}) => {
  const { t } = useTranslation();
  return (
    <Box height="90px">
      {showTitle && <Text color="swapWidget.secondary">{t('settings.slippage')}</Text>}
      <InputOptions>
        <TextInput
          value={slippageTolerance}
          addonAfter={
            <Box bgColor="swapWidget.detailsBackground" paddingX="10px" paddingY="4px" borderRadius={4}>
              <Text color="swapWidget.secondary">{t('settings.percent')}</Text>
            </Box>
          }
          isNumeric={true}
          placeholder="1"
          onChange={(value) => {
            setSlippageTolerance(value);
          }}
        />
        <NumberOptions
          options={[0.1, 0.5, 1]}
          isPercentage={true}
          currentValue={parseFloat(slippageTolerance)}
          variant="box"
          onChange={(number) => setSlippageTolerance(number.toString())}
          isDisabled={false}
        />
      </InputOptions>
      {Number(slippageTolerance) <= 0.1 && (
        <Text color="swapWidget.secondary" fontSize={12} marginBottom={10}>
          {t('transactionSettings.transactionMayFail')}
        </Text>
      )}
      {Number(slippageTolerance) > 50 && !expertMode ? (
        <Text color="error" fontSize="10px" marginBottom={10}>
          {t('transactionSettings.transactionActiveExpertMode')}
        </Text>
      ) : (
        Number(slippageTolerance) > 5 && (
          <Text color="primary" fontSize={12} marginBottom={10}>
            {t('transactionSettings.transactionMayFrontrun')}
          </Text>
        )
      )}
    </Box>
  );
};

export default SlippageInput;
