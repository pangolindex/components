import styled from 'styled-components';

export const Root = styled.div<{
  type: 'horizontal' | 'verticle';
}>`
  flex-direction: ${(props) => (props?.type === 'horizontal' ? 'row' : 'column')};
  display: flex;
`;
