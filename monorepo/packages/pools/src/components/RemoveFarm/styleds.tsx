import { ChefType } from '@pangolindex/sdk';
import styled from 'styled-components';
import { Box } from 'src/components';

export const FarmRemoveWrapper = styled(Box)`
  width: 100%;
  flex: 1;
`;
export const Root = styled(Box)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
export const RewardWrapper = styled(Box)`
  display: grid;
  grid-template-columns: minmax(auto, 50%) minmax(auto, 50%);
  grid-row-gap: 0px;
  grid-column-gap: 5px;
  justify-content: center;
  height: 100%;
`;
export const StatWrapper = styled(Box)`
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Buttons = styled(Box)<{ chefType: ChefType }>`
  display: grid;
  grid-template-columns: 1fr ${({ chefType }) => (chefType === ChefType.PANGO_CHEF ? '1fr' : '')};
  grid-gap: 20px;
  align-self: end;
  margin-top: 10px;
`;
