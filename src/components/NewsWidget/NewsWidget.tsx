import React, { useContext, useRef } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { ArrowLeft, ArrowRight } from 'react-feather';
import ReactMarkdown from 'react-markdown';
import Slider, { Settings } from 'react-slick';
import remarkGfm from 'remark-gfm';
import { ThemeContext } from 'styled-components';
import Earth from 'src/assets/images/earth.png';
import { Box } from 'src/components/Box';
import { Loader } from 'src/components/Loader';
import { News, useGetNews } from 'src/state/pnews/hooks';
import { ArrowWrapper, NewsContent, NewsDate, NewsSection, NewsTitle, SlickNext, TitleWrapper } from './styleds';
import { NewsProps } from './types';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

const NewsFeedSettings: Settings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  autoplay: false,
  autoplaySpeed: 10000,
};

const NewsWidget: React.FC<NewsProps> = ({ boxHeight = '400px' }) => {
  const theme = useContext(ThemeContext);
  const sliderRef = useRef<Slider | null>(null);
  const handleNewsNext = () => {
    sliderRef?.current?.slickNext();
  };
  const handleNewsBack = () => {
    sliderRef?.current?.slickPrev();
  };
  const { data: news, isLoading } = useGetNews();
  return (
    <NewsSection img={Earth}>
      <TitleWrapper>
        <NewsTitle>News</NewsTitle>
        <ArrowWrapper>
          <SlickNext onClick={handleNewsBack} style={{ right: 60 }}>
            <ArrowLeft size={20} style={{ minWidth: 24 }} />
          </SlickNext>
          <SlickNext onClick={handleNewsNext}>
            <ArrowRight size={20} style={{ minWidth: 24 }} />
          </SlickNext>
        </ArrowWrapper>
      </TitleWrapper>
      <div style={{ height: '100%' }}>
        {!isLoading ? (
          <Slider ref={sliderRef} {...NewsFeedSettings}>
            {news &&
              news.map((element: News) => (
                <div key={element.id}>
                  <NewsContent>
                    <Scrollbars
                      style={{ minHeight: boxHeight, padding: '0px 10px' }}
                      // eslint-disable-next-line react/prop-types
                      renderView={(props) => <div {...props} style={{ ...props.style, overflowX: 'hidden' }} />}
                      renderThumbVertical={(props) => (
                        <div
                          {...props}
                          style={{
                            // eslint-disable-next-line react/prop-types
                            ...props.style,
                            backgroundColor: theme.text1,
                            opacity: 0.2,
                            cursor: 'pointer',
                            borderRadius: '3px',
                          }}
                        />
                      )}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        linkTarget={'_blank'}
                        components={{
                          /* eslint-disable react/prop-types */
                          a: ({ children, ...props }) => {
                            const linkProps = props;
                            if (props.target === '_blank') {
                              linkProps['rel'] = 'noopener noreferrer';
                            }
                            return <a {...linkProps}>{children}</a>;
                          },
                        }}
                      >
                        {element.content}
                      </ReactMarkdown>
                    </Scrollbars>
                  </NewsContent>
                  <NewsDate>
                    {element?.updatedAt
                      ? element?.updatedAt?.toLocaleTimeString()
                      : element?.createdAt.toLocaleTimeString()}
                    , {element.updatedAt ? element?.updatedAt?.toDateString() : element?.createdAt.toDateString()}
                  </NewsDate>
                </div>
              ))}
          </Slider>
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <Loader size={100} />
          </Box>
        )}
      </div>
    </NewsSection>
  );
};

export default NewsWidget;
