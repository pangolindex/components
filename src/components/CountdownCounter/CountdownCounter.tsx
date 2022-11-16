import React, { useContext, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { ThemeContext } from 'styled-components';
import useInterval from 'src/hooks/useInterval';
import { CountdownCounterProps } from './types';
import 'react-circular-progressbar/dist/styles.css';

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
      styles={buildStyles({
        trailColor: theme.ghostWhite,
        pathColor: theme.primary,
      })}
    />
  );
};

export default CountdownCounter;
