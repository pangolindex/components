import styled, { css, keyframes } from 'styled-components';
import { Box } from 'src/components/index';

export const Wrapper = styled(Box)`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.color2};
  padding: 20px;
  display: grid;
  gap: 20px;
  border-radius: 10px;
  box-sizing: border-box;
`;

export const Frame = styled(Box)`
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 10px;
`;

export const rotateImg = keyframes`
  0% {
    transform: perspective(1000px) rotateY(0deg);
  }

  100% {
    transform: perspective(1000px) rotateY(360deg);
  }
`;

const animated = css`
  @keyframes rotateImage {
    0% {
      transform: perspective(1000px) rotateY(0deg);
    }

    100% {
      transform: perspective(1000px) rotateY(360deg);
    }
  }

  .Animated {
    animation: rotateImage 5s cubic-bezier(0.83, 0, 0.17, 1) infinite !important;
    filter: drop-shadow(rgba(0, 0, 0, 0.15) 0px 2px 4px) !important;
  }
`;

export const Container = styled(Box)`
  ${() => animated}
`;
