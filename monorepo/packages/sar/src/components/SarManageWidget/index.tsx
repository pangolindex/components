import React, { useState } from 'react';
import { Position } from 'src/hooks/types';
import AddStake from './AddStake';
import Claim from './Claim';
import Compound from './Compound';
import Unstake from './Unstake';
import { Wrapper } from './styleds';
import { Options } from './types';

interface Props {
  selectedPosition: Position | null;
  onSelectPosition: (position: Position | null) => void;
}

export default function SarMangePortfolio({ selectedPosition, onSelectPosition }: Props) {
  const [type, setType] = useState(Options.ADD);

  const handleChange = (value: Options) => {
    setType(value);
  };

  const renderBody = () => {
    switch (type) {
      case Options.ADD:
        return (
          <AddStake
            selectedPosition={selectedPosition}
            selectedOption={type}
            onChange={handleChange}
            onSelectPosition={onSelectPosition}
          />
        );
      case Options.UNSTAKE:
        return (
          <Unstake
            selectedPosition={selectedPosition}
            selectedOption={type}
            onChange={handleChange}
            onSelectPosition={onSelectPosition}
          />
        );
      case Options.CLAIM:
        return (
          <Claim
            selectedPosition={selectedPosition}
            selectedOption={type}
            onChange={handleChange}
            onSelectPosition={onSelectPosition}
          />
        );
      case Options.COMPOUND:
        return (
          <Compound
            selectedPosition={selectedPosition}
            selectedOption={type}
            onChange={handleChange}
            onSelectPosition={onSelectPosition}
          />
        );
      default:
        return (
          <AddStake
            selectedPosition={selectedPosition}
            selectedOption={type}
            onChange={handleChange}
            onSelectPosition={onSelectPosition}
          />
        );
    }
  };

  return <Wrapper id="sar-manage-widget">{renderBody()}</Wrapper>;
}
