import styled from 'styled-components';
import { Box } from 'src/components/Box';

// news section
export const NewsSection = styled(Box)<{ img: string }>`
  background-color: ${({ theme }) => theme.bg2};
  background-image: url(${(props) => props.img});
  background-repeat: no-repeat;
  background-position: bottom right;
  height: 100%;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  & .slick-slider {
    height: 100%;
    padding: 0px;

    .slick-dots {
      bottom: 0px;
      li button:before {
        color: ${({ theme }) => theme.text1};
      }
      li.slick-active button:before {
        color: ${({ theme }) => theme.text1};
      }
    }
  }

  & .slick-slide {
    height: auto;

    & div {
      height: 100%;
    }
  }

  & .slick-list {
    height: 100%;
    overflow: hidden;
  }

  & .slick-track {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
    height: 100%;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 600px;
  `};
`;

export const NewsTitle = styled(Box)`
  align-self: start;
  font-weight: bold;
  font-size: 24px;
  line-height: 48px;
  padding: 20px;
  background: linear-gradient(0deg, #ffc800, #ffc800);
  border-radius: 5px 0px 5px 0px;
`;

export const NewsContent = styled(Box)`
  color: ${({ theme }) => theme.text7};
  font-weight: 400;
  font-size: 16px;
  line-height: 27px;
  height: 90% !important;
  padding: 0px 20px;
  & a {
    color: ${({ theme }) => theme.text7};
  }
`;

export const NewsDate = styled(Box)`
  font-size: 10px;
  line-height: 15px;
  display: flex;
  align-items: center;
  color: #929292;
  margin-bottom: 15px;
  height: 10% !important;
  padding: 0px 10px;
`;

export const SlickNext = styled(Box)<{ onClick: () => void }>`
  background: ${({ theme }) => theme.primary};
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    cursor: pointer;
  }
  z-index: 9999;
`;

export const TitleWrapper = styled(Box)`
  display: flex;
  justify-content: space-between;
`;

export const ArrowWrapper = styled(Box)`
  display: flex;
  gap: 10px;
  padding: 20px;
`;
