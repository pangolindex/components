import { BigNumber } from 'ethers';
import { useUserAtom } from 'src/state';

// combines the current timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber | undefined {
  const { userState } = useUserAtom();

  const ttl = userState.userDeadline;
  const currentTimestampSeconds = BigNumber.from(Math.ceil(Date.now() / 1000));
  return ttl ? currentTimestampSeconds.add(ttl) : undefined;
}
