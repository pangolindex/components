import React, { useState } from 'react';
import Claim from './Claim';
import Compound from './Compound';
import Stake from './Stake';
import Unstake from './Unstake';
import { Root, Wrapper } from './styleds';
import { Options } from './types';

export default function SarStakingWidget() {
  const [type, setType] = useState(Options.STAKE);

  const handleChange = (value: Options) => {
    setType(value);
  };

  const renderBody = () => {
    switch (type) {
      case Options.STAKE:
        return <Stake selectedOption={type} onChange={handleChange} />;
      case Options.UNSTAKE:
        return <Unstake selected={type} onChange={handleChange} />;
      case Options.CLAIM:
        return <Claim selected={type} onChange={handleChange} />;
      case Options.COUMPOUND:
        return <Compound selected={type} onChange={handleChange} />;
      default:
        return <Stake selectedOption={type} onChange={handleChange} />;
    }
  };

  return (
    <Root>
      <Wrapper>{renderBody()}</Wrapper>
    </Root>
  );
}
