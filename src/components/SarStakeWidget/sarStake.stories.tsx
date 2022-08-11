import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { Position } from 'src/state/psarstake/hooks';
import SarManageWidget from '../SarManageWidget';
import SarNFTPortfolio from '../SarNFTPortfolio';
import SarStakeWidget from '.';

export default {
  component: SarStakeWidget,
  title: 'Components/SarStakeWidget',
};

const TemplateSarStakingWidget: ComponentStory<typeof SarStakeWidget> = (args: any) => (
  <div style={{ width: '500px' }}>
    <SarStakeWidget {...args} />
  </div>
);

export const Default = TemplateSarStakingWidget.bind({});

const CompleteTemplateSarStakingWidget: ComponentStory<any> = () => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const onSelectPosition = (position: Position | null) => {
    setSelectedPosition(position);
  };

  return (
    <div style={{ display: 'flex', margin: 'auto' }}>
      <div style={{ width: '75%', marginRight: '20px' }}>
        <SarNFTPortfolio onSelectPosition={onSelectPosition} />
      </div>
      <div style={{ width: '25%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '10px' }}>
          <SarManageWidget selectedPosition={selectedPosition} />
        </div>
        <div>
          <SarStakeWidget />
        </div>
      </div>
    </div>
  );
};

export const Complete = CompleteTemplateSarStakingWidget.bind({});
