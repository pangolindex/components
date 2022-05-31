import React, { useContext } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { Text } from 'src/components';
import { Wrapper } from './styled';

interface Props {
  onToggle: () => void;
  showMore: boolean;
}

const ShowMore: React.FC<Props> = (props) => {
  const { onToggle, showMore } = props;
  const theme = useContext(ThemeContext);

  return (
    <Wrapper onClick={() => onToggle()}>
      <Text color="text2" fontSize={16} fontWeight={500} marginLeft={'6px'} textAlign="center">
        {showMore ? 'See Less' : 'See More'}
      </Text>

      {showMore ? (
        <ChevronUp size="16" color={theme.text2} style={{ marginLeft: '4px' }} />
      ) : (
        <ChevronDown size="16" color={theme.text2} style={{ marginLeft: '4px' }} />
      )}
    </Wrapper>
  );
};

export default ShowMore;
