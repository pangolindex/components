import React, { useContext, useEffect } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import { ThemeContext } from 'styled-components';
import useInterval from 'src/hooks/useInterval';
import { CountdownCounterProps } from './types';

const CountdownCounter: React.FC<CountdownCounterProps> = (props) => {
  const {
    value,
    minValue,
    maxValue,
    text,
    strokeWidth,
    background,
    backgroundPadding,
    circleRatio,
    counterClockwise,
    onFinish,
  } = props;
  const [percentage, setPercentage] = React.useState<number>(value);
  const theme = useContext(ThemeContext);

  useEffect(() => {
    if (percentage === minValue) {
      onFinish && onFinish();
    }
  }, [percentage, minValue]);

  const setCurrentPercentage = () => {
    setPercentage(percentage - 1);
  };

  useInterval(setCurrentPercentage, 1000);

  return (
    <CircularProgressbar
      value={percentage}
      maxValue={maxValue}
      minValue={minValue}
      text={text}
      strokeWidth={strokeWidth}
      background={background}
      backgroundPadding={backgroundPadding}
      circleRatio={circleRatio}
      counterClockwise={counterClockwise}
      styles={{
        path: {
          stroke: theme.primary,
          strokeLinecap: 'round',
          transition: 'stroke-dashoffset 0.5s ease 0s',
          transformOrigin: 'center center',
        },
        trail: {
          stroke: theme.ghostWhite,
          strokeLinecap: 'round',
          transform: 'rotate(0.25turn)',
          transformOrigin: 'center center',
        },
        text: {
          fontSize: '16px',
        },
      }}
    />
  );
};

export default CountdownCounter;
