import { useChainId, usePangolinWeb3 } from '@honeycomb/shared';
import { useTransactionAdder } from '@honeycomb/state-hooks';
import { hederaFn } from '@honeycomb/wallet-connectors';
import { BigNumber } from 'ethers';
import { useSarNftGovernanceContract } from './useContract';

export function useHederaVoteCallback(): {
  voteCallback: (
    proposalId: string | undefined,
    support: boolean,
    nftId?: BigNumber,
  ) => undefined | Promise<string | undefined>;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const govContract = useSarNftGovernanceContract();
  const addTransaction = useTransactionAdder();

  const voteCallback = async (proposalId: string | undefined, support: boolean, nftId?: BigNumber) => {
    if (!account || !govContract || !proposalId || !nftId) return;

    try {
      const args = {
        proposalId,
        support,
        nftId: nftId?.toString(),
        account,
        chainId,
      };

      const response = await hederaFn.castVote(args);
      if (response) {
        addTransaction(response, {
          summary: `Voted ${support ? 'for ' : 'against'} proposal ${proposalId}`,
        });

        return response?.hash;
      }
      return;
    } catch (err) {
      const _err = err as any;
      // we only care if the error is something _other_ than the user rejected the tx
      if (_err?.code !== 4001) {
        console.error(_err);
      }
    }
  };

  return { voteCallback };
}
