import { Button } from '@honeycomb/core';
import { usePoolDetailnModalToggle } from '@honeycomb/state-hooks';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { useGetMinichefStakingInfos } from '../Pool/mock';
import DetailModal from '.';

export default {
  component: DetailModal,
  title: 'DeFi Primitives/Pool/PoolDetailModal',
};

const SamplePoolDetail: ComponentStory<typeof DetailModal> = () => {
  const togglePoolDetailModal = usePoolDetailnModalToggle();
  const stakingInfo = useGetMinichefStakingInfos();

  return (
    <div style={{ padding: 20 }}>
      <Button variant="primary" onClick={() => togglePoolDetailModal()}>
        {'Pool Detail'}
      </Button>

      <DetailModal stakingInfo={stakingInfo} version={2} />
    </div>
  );
};

export const PoolDetail = SamplePoolDetail.bind({});
