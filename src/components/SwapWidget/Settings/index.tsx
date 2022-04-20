import React, { useCallback, useContext, useState } from 'react';
import { ThemeContext } from 'styled-components';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import { NumberOptions } from 'src/components/NumberOptions';
import { Text } from 'src/components/Text';
import { TextInput } from 'src/components/TextInput';
import { ToggleButtons } from 'src/components/ToggleButtons';
import { useExpertModeManager, useUserDeadline, useUserSlippageTolerance } from 'src/state/puser/hooks';

import WarningModal from './WarningModal';
import { Frame, InputOptions } from './styled';

interface Props {
  isOpen: boolean;
  close: () => void;
}

const SwapSettingsDrawer: React.FC<Props> = ({ isOpen, close }) => {
  const theme = useContext(ThemeContext);

  const [userExpertMode, setUserExpertMode] = useExpertModeManager();
  const [userslippage, setUserSlippageTolerance] = useUserSlippageTolerance();
  const [userDeadline, setUserDeadline] = useUserDeadline();

  const [deadline, setDeadline] = useState(userDeadline);
  const [expertMode, setExpertMode] = useState(userExpertMode);
  const [slippageTolerance, setSlippageTolerance] = useState((userslippage / 100).toString());

  const [modalOpen, setModalOpen] = useState(false);

  const save = useCallback(() => {
    setUserDeadline(deadline);
    setUserExpertMode(expertMode);
    if (slippageTolerance.length == 0) {
      setUserSlippageTolerance(0);
    }
    setUserSlippageTolerance(Math.ceil(parseFloat(slippageTolerance) * 100));
    close();
  }, [deadline, expertMode, slippageTolerance]);

  return (
    <Drawer title="Settings" isOpen={isOpen} onClose={close}>
      <WarningModal isOpen={modalOpen} close={() => setModalOpen(false)} setExpertMode={setExpertMode} />
      <Frame>
        {/*SLIPPAGE INPUT */}
        <Box height="90px">
          <Text color="text1">Slippage</Text>
          <InputOptions>
            <TextInput
              value={slippageTolerance}
              addonAfter={
                <Box bgColor="bg2" paddingX="8px" paddingY="4px" borderRadius={4}>
                  <Text color="text4">Percent</Text>
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
            <Text color="text1" fontSize={12} marginBottom={10}>
              {' '}
              Your transaction may fail
            </Text>
          )}
        </Box>
        {/*DEADLINE INPUT */}
        <Box height="90px">
          <Text color="text1">Time Limit</Text>
          <InputOptions>
            <TextInput
              value={deadline}
              addonAfter={
                <Box bgColor="bg2" paddingX="8px" paddingY="4px" borderRadius={4}>
                  <Text color="text4">Seconds</Text>
                </Box>
              }
              isNumeric={true}
              placeholder="10"
              onChange={(number) => setDeadline(parseInt(number))}
            />
            <NumberOptions
              options={[60, 300, 600]}
              currentValue={deadline}
              variant="box"
              onChange={(number) => setDeadline(number)}
              isDisabled={false}
            />
          </InputOptions>
        </Box>
        {/*EXPERT MODE INPUT */}
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" style={{ gap: '15px' }}>
          <Text color="text1">Toogle Expert Mode</Text>
          <ToggleButtons
            options={['ON', 'OFF']}
            value={expertMode === true ? 'ON' : 'OFF'}
            onChange={(value) => {
              if (value === 'ON') {
                setModalOpen(true);
              } else {
                setExpertMode(false);
              }
            }}
          />
        </Box>
        <Box display="flex" flexDirection="column" alignContent="center" style={{ gap: '10px' }}>
          <Button variant="primary" onClick={save}>
            Save &amp; Close
          </Button>
          <Button variant="plain" backgroundColor={theme.bg6} onClick={close} color="text1">
            Close
          </Button>
        </Box>
      </Frame>
    </Drawer>
  );
};

export default SwapSettingsDrawer;
