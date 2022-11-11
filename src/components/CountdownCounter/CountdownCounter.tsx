import React, { useContext, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { ThemeContext } from 'styled-components';
import useInterval from 'src/hooks/useInterval';
import { CountdownCounterProps } from './types';
import 'react-circular-progressbar/dist/styles.css';

const CountdownCounter: React.FC<CountdownCounterProps> = (props) => {
  const [percentage, setPercentage] = React.useState<number>(props.value);
  const theme = useContext(ThemeContext);

  useEffect(() => {
    if (percentage === props.minValue) {
      props.onFinish && props.onFinish();
    }
  }, [percentage]);

  const setCurrentPercentage = () => {
    setPercentage(percentage - 1);
  };

  useInterval(setCurrentPercentage, 1000);

  return (
    <CircularProgressbar
      value={percentage}
      maxValue={props.maxValue}
      minValue={props.minValue}
      text={props.text}
      strokeWidth={props.strokeWidth}
      background={props.background}
      backgroundPadding={props.backgroundPadding}
      circleRatio={props.circleRatio}
      counterClockwise={props.counterClockwise}
      styles={buildStyles({
        trailColor: theme.ghostWhite,
        pathColor: theme.primary,
      })}
    />
  );
};

export default CountdownCounter;
