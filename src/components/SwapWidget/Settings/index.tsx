import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ThemeContext } from 'styled-components';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import { NumberOptions } from 'src/components/NumberOptions';
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
  widgetBackground?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  inputFieldBgColor?: string;
  btnPrimaryBgColor?: string;
  btnPrimaryTextColor?: string;
  toggleBgColor?: string;
  toggleSelectedColor?: string;
  toggleTextColor?: string;
}

const SwapSettingsDrawer: React.FC<Props> = ({
  isOpen,
  close,
  widgetBackground,
  textPrimaryColor,
  textSecondaryColor,
  inputFieldBgColor,
  btnPrimaryBgColor,
  btnPrimaryTextColor,
  toggleBgColor,
  toggleSelectedColor,
  toggleTextColor,
}) => {
  const theme = useContext(ThemeContext);

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
    <Drawer
      title="Settings"
      isOpen={isOpen}
      onClose={close}
      widgetBackground={widgetBackground}
      textPrimaryColor={textPrimaryColor}
      textSecondaryColor={textSecondaryColor}
    >
      <WarningModal isOpen={modalOpen} close={() => setModalOpen(false)} setExpertMode={setExpertMode} />
      <Frame>
        {/*SLIPPAGE INPUT */}
        <Box height="90px">
          <Text color="text1" style={textPrimaryColor ? { color: textPrimaryColor } : {}}>
            Slippage
          </Text>
          <InputOptions>
            <TextInput
              value={slippageTolerance}
              addonAfter={
                <Box bgColor="bg2" paddingX="10px" paddingY="4px" borderRadius={4}>
                  <Text color="text4">Percent</Text>
                </Box>
              }
              isNumeric={true}
              placeholder="1"
              onChange={(value) => {
                setSlippageTolerance(value);
              }}
              textSecondaryColor={textSecondaryColor}
              inputFieldBgColor={inputFieldBgColor}
              style={
                inputFieldBgColor && textSecondaryColor
                  ? { backgroundColor: inputFieldBgColor, color: textSecondaryColor }
                  : {}
              }
            />
            <NumberOptions
              options={[0.1, 0.5, 1]}
              isPercentage={true}
              currentValue={parseFloat(slippageTolerance)}
              variant="box"
              onChange={(number) => setSlippageTolerance(number.toString())}
              isDisabled={false}
              btnPrimaryBgColor={btnPrimaryBgColor}
              btnPrimaryTextColor={btnPrimaryTextColor}
            />
          </InputOptions>
          {Number(slippageTolerance) <= 0.1 && (
            <Text
              color="text1"
              fontSize={12}
              marginBottom={10}
              style={textPrimaryColor ? { color: textPrimaryColor } : {}}
            >
              Your transaction may fail
            </Text>
          )}
          {Number(slippageTolerance) > 50 && !expertMode ? (
            <Text
              color="text12"
              fontSize="10px"
              marginBottom={10}
              style={textPrimaryColor ? { color: textPrimaryColor } : {}}
            >
              Very high slippage, activate expert mode to be able to use more than 50%
            </Text>
          ) : (
            Number(slippageTolerance) > 5 && (
              <Text
                color="yellow2"
                fontSize={12}
                marginBottom={10}
                style={textPrimaryColor ? { color: textPrimaryColor } : {}}
              >
                Your transaction may be frontrun
              </Text>
            )
          )}
        </Box>
        {/*DEADLINE INPUT */}
        <Box height="90px">
          <Text color="text1" style={textPrimaryColor ? { color: textPrimaryColor } : {}}>
            Time Limit
          </Text>
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
              onChange={(number) => setDeadline(number.toString())}
              textSecondaryColor={textSecondaryColor}
              inputFieldBgColor={inputFieldBgColor}
              style={
                inputFieldBgColor && textSecondaryColor
                  ? { backgroundColor: inputFieldBgColor, color: textSecondaryColor }
                  : {}
              }
            />
            <NumberOptions
              options={[60, 300, 600]}
              currentValue={parseInt(deadline)}
              variant="box"
              onChange={(number) => setDeadline(number.toString())}
              isDisabled={false}
              btnPrimaryBgColor={btnPrimaryBgColor}
              btnPrimaryTextColor={btnPrimaryTextColor}
            />
          </InputOptions>
          {Number(deadline) <= 1 && (
            <Text color="text1" fontSize={12} marginBottom={10}>
              {' '}
              Your transaction may fail
            </Text>
          )}
        </Box>
        {/*EXPERT MODE INPUT */}
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" style={{ gap: '15px' }}>
          <Text color="text1" style={textPrimaryColor ? { color: textPrimaryColor } : {}}>
            Toggle Expert Mode
          </Text>
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
              toggleBgColor={toggleBgColor}
              toggleSelectedColor={toggleSelectedColor}
              toggleTextColor={toggleTextColor}
            />
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" alignContent="center" style={{ gap: '10px' }}>
          <Button
            variant="primary"
            onClick={save}
            isDisabled={!isValidValues}
            btnPrimaryBgColor={btnPrimaryBgColor}
            btnPrimaryTextColor={btnPrimaryTextColor}
          >
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
