import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '@pangolindex/locales';
import { Box, Button, Drawer, NumberOptions, ToggleButtons, TextInput, Text, SlippageInput } from '@pangolindex/core';
import { DEFAULT_DEADLINE_FROM_NOW } from '@pangolindex/constants';
import { useExpertModeManager, useUserDeadline, useUserSlippageTolerance } from '@pangolindex/state';
import WarningModal from './WarningModal';
import { Frame, InputOptions } from './styled';

interface Props {
  isOpen: boolean;
  close: () => void;
}

const SwapSettingsDrawer: React.FC<Props> = ({ isOpen, close }) => {
  const [userExpertMode, setUserExpertMode] = useExpertModeManager();
  const [userslippage, setUserSlippageTolerance] = useUserSlippageTolerance();
  const [userDeadline, setUserDeadline] = useUserDeadline();

  const [deadline, setDeadline] = useState(userDeadline);
  const [expertMode, setExpertMode] = useState(userExpertMode);
  const [slippageTolerance, setSlippageTolerance] = useState((userslippage / 100).toString());

  const [isValidValues, setValidValues] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();

  const save = useCallback(() => {
    if (deadline.length == 0) {
      setUserDeadline(DEFAULT_DEADLINE_FROM_NOW);
    } else {
      setUserDeadline(deadline);
    }

    setUserExpertMode(expertMode);

    if (slippageTolerance.length == 0) {
      setUserSlippageTolerance(0);
    } else {
      let slippageToleranceNumber = parseFloat(slippageTolerance);
      if (!expertMode && slippageToleranceNumber > 50) {
        setUserSlippageTolerance(5000);
      } else {
        if (slippageToleranceNumber > 100) {
          slippageToleranceNumber = 100;
        }
        setUserSlippageTolerance(Math.ceil(slippageToleranceNumber * 100));
      }
    }
    close();
  }, [deadline, expertMode, slippageTolerance]);

  useEffect(() => {
    const slippageToleranceNumber = parseFloat(slippageTolerance);
    const deadlineNumber = parseFloat(deadline);
    if (slippageTolerance.length === 0 || deadline.length === 0) {
      setValidValues(false);
    } else if (!expertMode && slippageToleranceNumber > 50) {
      setValidValues(false);
    } else if (slippageToleranceNumber > 100 || slippageToleranceNumber <= 0 || deadlineNumber <= 0) {
      setValidValues(false);
    } else {
      setValidValues(true);
    }
  }, [expertMode, slippageTolerance, deadline]);

  return (
    <Drawer title="Settings" isOpen={isOpen} onClose={close}>
      <WarningModal isOpen={modalOpen} close={() => setModalOpen(false)} setExpertMode={setExpertMode} />
      <Frame>
        <SlippageInput
          expertMode={expertMode}
          slippageTolerance={slippageTolerance}
          setSlippageTolerance={setSlippageTolerance}
        />
        {/*DEADLINE INPUT */}
        <Box height="90px">
          <Text color="swapWidget.secondary">{t('settings.timeLimit')}</Text>
          <InputOptions>
            <TextInput
              value={deadline}
              addonAfter={
                <Box bgColor="swapWidget.detailsBackground" paddingX="8px" paddingY="4px" borderRadius={4}>
                  <Text color="swapWidget.secondary">{t('settings.seconds')}</Text>
                </Box>
              }
              isNumeric={true}
              placeholder="10"
              onChange={(number) => setDeadline(number.toString())}
            />
            <NumberOptions
              options={[60, 300, 600]}
              currentValue={parseInt(deadline)}
              variant="box"
              onChange={(number) => setDeadline(number.toString())}
              isDisabled={false}
            />
          </InputOptions>
          {Number(deadline) <= 1 && (
            <Text color="swapWidget.secondary" fontSize={12} marginBottom={10}>
              {' '}
              {t('transactionSettings.transactionMayFail')}
            </Text>
          )}
        </Box>
        {/*EXPERT MODE INPUT */}
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" style={{ gap: '15px' }}>
          <Text color="swapWidget.secondary">{t('settings.toggleExpertMode')}</Text>
          <Box width="120px">
            <ToggleButtons
              options={['ON', 'OFF']}
              value={expertMode ? 'ON' : 'OFF'}
              onChange={(value) => {
                if (value === 'ON' && !expertMode) {
                  setModalOpen(true);
                } else if (value === 'OFF' && expertMode) {
                  setExpertMode(false);
                }
              }}
            />
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" alignContent="center" style={{ gap: '10px' }}>
          <Button variant="primary" onClick={save} isDisabled={!isValidValues}>
            {t('common.save')} &amp; {t('common.close')}
          </Button>
          <Button variant="plain" onClick={close} color="swapWidget.secondary">
            {t('common.close')}
          </Button>
        </Box>
      </Frame>
    </Drawer>
  );
};

export default SwapSettingsDrawer;
