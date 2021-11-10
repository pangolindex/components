import * as React from 'react';
import { IconDot, StepCounter, StepItem, StepName } from './styles';
import { StepProps } from './types';

const Step: React.FC<StepProps> = (props) => {
  const { active, completed, stepNumber, disabled, title, progressDot, stepIndex, onStepClick } = props;

  const renderIconNode = () => {
    let iconNode;

    if (progressDot) {
      iconNode = <IconDot completed={completed} active={active} />;
    } else {
      iconNode = (
        <StepCounter completed={completed} active={active}>
          {stepNumber}
        </StepCounter>
      );
    }

    return iconNode;
  };

  const onClick: React.MouseEventHandler<HTMLDivElement> = () => {
    onStepClick && onStepClick(stepIndex || 0);
  };

  return (
    <StepItem completed={completed} active={active} onClick={onClick} disabled={disabled} progressDot={progressDot}>
      {renderIconNode()}
      {active && <StepName> {title}</StepName>}
    </StepItem>
  );
};

export default Step;
