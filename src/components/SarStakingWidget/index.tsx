import React, { useState } from 'react';
import { Position } from 'src/state/psarstake/hooks';
import AddStake from './AddStake';
import Claim from './Claim';
import Compound from './Compound';
import Stake from './Stake';
import Unstake from './Unstake';
import { Root, Wrapper } from './styleds';
import { Options } from './types';

interface Props {
  selectedPosition: Position | null;
}

export default function SarStakingWidget({ selectedPosition }: Props) {
  const [type, setType] = useState(Options.ADD);

  const handleChange = (value: Options) => {
    setType(value);
  };

  const renderBody = () => {
    switch (type) {
      case Options.ADD:
        return <AddStake selectedPosition={selectedPosition} selectedOption={type} onChange={handleChange} />;
      case Options.UNSTAKE:
        return <Unstake selectedPosition={selectedPosition} selectedOption={type} onChange={handleChange} />;
      case Options.CLAIM:
        return <Claim selectedPosition={selectedPosition} selectedOption={type} onChange={handleChange} />;
      case Options.COUMPOUND:
        return <Compound selectedPosition={selectedPosition} selectedOption={type} onChange={handleChange} />;
      default:
        return <AddStake selectedPosition={selectedPosition} selectedOption={type} onChange={handleChange} />;
    }
  };

  return (
    <Root>
      <Wrapper>{renderBody()}</Wrapper>
      <Wrapper mt="10px" zIndex={100}>
        <Stake />
      </Wrapper>
    </Root>
  );
}
