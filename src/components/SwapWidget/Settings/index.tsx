import React, { useCallback, useContext, useState } from 'react';
import { ThemeContext } from 'styled-components';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import NumberOptions from 'src/components/NumberOptions';
import { Text } from 'src/components/Text';
import { TextInput } from 'src/components/TextInput';
import { ToggleButtons } from 'src/components/ToggleButtons';
import { useExpertModeManager, useUserDeadline, useUserSlippageTolerance } from 'src/state/puser/hooks';

import { Frame, InputOptions } from './styled';

interface Props {
  isOpen: boolean;
  close: () => void;
}

const SwapSettingsDrawer: React.FC<Props> = ({ isOpen, close }) => {
  const theme = useContext(ThemeContext);

  const [isExpertMode, setUserExpertMode] = useExpertModeManager();
  const [slippage, setUserSlippageTolerance] = useUserSlippageTolerance();
  const [userDeadline, setUserDeadline] = useUserDeadline();

  const [deadline, setDeadline] = useState(userDeadline);
  const [expertMode, setExpertMode] = useState(isExpertMode);
  const [slippageTolerance, setSlippageTolerance] = useState(slippage);

  const save = useCallback(() => {
    setUserDeadline(deadline);
    setUserExpertMode(expertMode);
    setUserSlippageTolerance(slippageTolerance);
    close();
  }, [deadline, expertMode, slippageTolerance]);

  return (
    <Drawer title="Settings" isOpen={isOpen} onClose={close}>
      <Frame>
        {/*SLIPPAGE INPUT */}
        <Box marginBottom={15}>
          <Text color="text1" style={{ gridArea: 'label' }}>
            Slippage
          </Text>
          <InputOptions>
            <TextInput
              value={slippageTolerance / 100}
              addonAfter={
                <Box bgColor="bg2" paddingX="8px" paddingY="4px" borderRadius={4}>
                  <Text color="text4">Percentage</Text>
                </Box>
              }
              isNumeric={true}
              placeholder="1%"
              onChange={(number) => setSlippageTolerance(number * 100)}
            />
            <NumberOptions
              options={[0.1, 0.5, 1]}
              isPercentage={true}
              currentValue={slippageTolerance / 100}
              variant="box"
              onChange={(number) => setSlippageTolerance(number * 100)}
              isDisabled={false}
            />
          </InputOptions>
        </Box>
        {/*DEADLINE INPUT */}
        <Box marginBottom={15}>
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
              placeholder="0"
              onChange={(number) => setDeadline(Number(number))}
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
        <Box marginBottom={20}>
          <Text color="text1">Toogle Expert Mode</Text>
          <ToggleButtons
            options={['ON', 'OFF']}
            value={expertMode === true ? 'ON' : 'OFF'}
            onChange={() => {
              setExpertMode(!expertMode);
            }}
          />
        </Box>
        <Box marginBottom={10}>
          <Button variant="primary" onClick={save}>
            Save &amp; Close
          </Button>
        </Box>
        <Box marginBottom={20}>
          <Button variant="plain" backgroundColor={theme.bg6} onClick={close} color="text1">
            Close
          </Button>
        </Box>
      </Frame>
    </Drawer>
  );
};

export default SwapSettingsDrawer;
