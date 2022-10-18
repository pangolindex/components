import { Route } from 'src/state/pbridge/types';

export type BridgeRouteProps = Route & {
  onSelectRoute: () => void;
};
