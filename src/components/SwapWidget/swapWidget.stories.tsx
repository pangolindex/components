import { ComponentStory } from '@storybook/react';
import React from 'react';
import { defaultColors as theme } from '../../theme';
import { Box } from '../Box';
import SwapWidget from '.';

export default {
  component: SwapWidget,
  title: 'Components/SwapWidget',
};

const TemplateSwapWidget: ComponentStory<typeof SwapWidget> = (args: any) => {
  return (
    <Box width="100%">
      <Box maxWidth="400px">
        <SwapWidget {...args} />
      </Box>
    </Box>
  );
};

export const Default = TemplateSwapWidget.bind({});
Default.args = {
  isLimitOrderVisible: false,
  showSettings: true,
  widgetBackground: theme.bg2,
  textPrimaryColor: theme.text1,
  textSecondaryColor: theme.text4,
  btnPrimaryBgColor: theme.primary,
  btnPrimaryTextColor: theme.black,
  btnConfirmedBgColor: theme.oceanBlue,
  btnConfirmedTextColor: theme.oceanBlue,
  settingsBtnBgColor: theme.platinum,
  selectPrimaryBgColor: theme.primary,
  selectSecondaryBgColor: theme.ghostWhite,
  toggleBgColor: theme.platinum,
  toggleSelectedColor: theme.ghostWhite,
  toggleTextColor: theme.chineseBlack,
  inputFieldBgColor: theme.bg1,
  switchOnHandleColor: theme?.switch?.onColor,
};
