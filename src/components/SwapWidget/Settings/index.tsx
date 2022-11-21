import React, { useCallback, useEffect, useState } from 'react';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import { NumberOptions } from 'src/components/NumberOptions';
import SlippageInput from 'src/components/SlippageInput';
import { Text } from 'src/components/Text';
import { TextInput } from 'src/components/TextInput';
import { ToggleButtons } from 'src/components/ToggleButtons';
import { DEFAULT_DEADLINE_FROM_NOW } from 'src/constants';
import { useExpertModeManager, useUserDeadline, useUserSlippageTolerance } from 'src/state/puser/hooks';

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
    if (slippageTolerance.length == 0) {
      setValidValues(false);
    } else if (!expertMode && slippageToleranceNumber > 50) {
      setValidValues(false);
    } else if (slippageToleranceNumber > 100 || slippageToleranceNumber <= 0) {
      setValidValues(false);
    } else {
      setValidValues(true);
    }
  }, [expertMode, slippageTolerance]);

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
          <Text color="swapWidget.secondary">Time Limit</Text>
          <InputOptions>
            <TextInput
              value={deadline}
              addonAfter={
                <Box bgColor="swapWidget.detailsBackground" paddingX="8px" paddingY="4px" borderRadius={4}>
                  <Text color="swapWidget.secondary">Seconds</Text>
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
              Your transaction may fail
            </Text>
          )}
        </Box>
        {/*EXPERT MODE INPUT */}
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" style={{ gap: '15px' }}>
          <Text color="swapWidget.secondary">Toggle Expert Mode</Text>
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
            Save &amp; Close
          </Button>
          <Button variant="plain" onClick={close} color="swapWidget.secondary">
            Close
          </Button>
        </Box>
      </Frame>
    </Drawer>
  );
};

export default SwapSettingsDrawer;
