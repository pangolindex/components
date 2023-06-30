import { TransactionResponse } from '@ethersproject/providers';
import { AirdropType, NetworkType, Token, TokenAmount } from '@pangolindex/sdk';
import axios from 'axios';
import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useChainId, useLibrary, usePangolinWeb3, usePngSymbol } from 'src/hooks';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { hederaFn } from 'src/utils/hedera';
import { useContract } from '../../hooks/useContract';
import { calculateGasMargin, getChainByNumber, waitForTransaction } from '../../utils';
import { useTransactionAdder } from '../ptransactions/hooks';
import { airdropAbiMapping } from './contants';

/**
 * This hook returns the airdrop contract of the specified type
 * @param address Address of contract
 * @param type Type of airdrop
 * @returns Airdrop contract instance
 */
export function useMerkledropContract(address: string, type: AirdropType) {
  const abi = airdropAbiMapping[type];
  return useContract(address, abi, true);
}

/**
 * This hook return the claimed amount of a connected account
 * @param airdropAddress Address of airdrop contract
 * @param token Airdropped token
 * @returns TokenAmount, amount claimed
 */
export function useMerkledropClaimedAmounts(airdropAddress: string, token: Token) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const merkledropContract = useMerkledropContract(airdropAddress, AirdropType.MERKLE);
  return useQuery(['claimed-airdrop-amount', merkledropContract?.address, account, chainId], async () => {
    if (!account || !merkledropContract) {
      return new TokenAmount(token, '0');
    }
    const claimedAmount: BigNumber = await merkledropContract.claimedAmounts(account);
    return new TokenAmount(token, claimedAmount.toString());
  });
}

/**
 * This hook return the markledrop proofs and claim amount of a connected account
 * @param airdropAddress Address of airdrop contract
 * @param token Airdropped token
 * @returns The proof, the root and the claim amount
 */
export function useMerkledropProof(airdropAddress: string, token: Token) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  return useQuery(
    ['MerkledropProof', account, chainId, airdropAddress],
    async () => {
      if (!account)
        return {
          amount: new TokenAmount(token, '0'),
          proof: [],
          root: '',
        };

      try {
        // TODO: update this url to dynamically
        const response = await axios.get(
          `https://static.pangolin.exchange/merkle-drop/${chainId}/${airdropAddress.toLocaleLowerCase()}/${account.toLocaleLowerCase()}.json`,
          {
            timeout: 1000,
          },
        );
        if (response.status !== 200) {
          return {
            amount: new TokenAmount(token, '0'),
            proof: [],
            root: '',
          };
        }
        const data = response.data;
        return {
          amount: new TokenAmount(token, data.amount),
          proof: data.proof as string[],
          root: data.root as string,
        };
      } catch (error) {
        return {
          amount: new TokenAmount(token, '0'),
          proof: [],
          root: '',
        };
      }
    },
    {
      cacheTime: 1000 * 60 * 60 * 1, // 1 hour
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 60 * 1, // 1 hour
    },
  );
}

interface ClaimAirdropReturn {
  /** Function to handle the claim process */
  onClaim: () => Promise<void>;
  /** Function to handle cancellation */
  onDimiss: () => void;
  /** Claim transaction hash */
  hash: string | null;
  /** If the transaction is executing */
  attempting: boolean;
  /** The error message  */
  error: string | null;
}

/**
 * This hook returns functions to help to make the claim process
 * @param airdropAddress Address of airdrop contract
 * @param airdropType Type of airdrop contract
 * @param token Airdropped token
 * @returns Functions to make the claim process
 */
export function useClaimAirdrop(airdropAddress: string, airdropType: AirdropType, token: Token): ClaimAirdropReturn {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { provider } = useLibrary();
  const pngSymbol = usePngSymbol();

  const merkledropContract = useMerkledropContract(airdropAddress, airdropType);
  const { data } = useMerkledropProof(airdropAddress, token);

  const [hash, setHash] = useState<string | null>(null);
  const [attempting, setAttempting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addTransaction = useTransactionAdder();

  const mixpanel = useMixpanel();

  const onDimiss = () => {
    setHash(null);
    setAttempting(false);
    setError(null);
  };

  const onClaim = async () => {
    if (!merkledropContract || !data || data.proof.length === 0 || !account) return;
    setAttempting(true);
    try {
      const args = airdropType === AirdropType.LEGACY ? [] : [data.amount.raw.toString(), data.proof];
      let summary = `Claimed ${pngSymbol}`;

      if (airdropType === AirdropType.MERKLE_TO_STAKING_COMPLIANT) {
        summary += ' and deposited in the SAR';

        const message = `By signing this transaction, I hereby acknowledge that I am not a US resident or citizen. (Citizens or residents of the United States of America are not allowed to the ${pngSymbol} token airdrop due to applicable law.)`;
        let signature = await provider?.execute('personal_sign', [message, account]);

        const v = parseInt(signature.slice(130, 132), 16);

        // Ensure v is 27+ (generally 27|28)
        // Ledger and perhaps other signing methods utilize a 'v' of 0|1 instead of 27|28
        if (v < 27) {
          const vAdjusted = v + 27;
          console.log(`Adjusting ECDSA 'v' from ${v} to ${vAdjusted}`);
          signature = signature.slice(0, -2).concat(vAdjusted.toString(16));
        }

        args.push(signature);
      }
      const chain = getChainByNumber(chainId);

      let response: { hash: string } | null = null;
      if (chain?.network_type === NetworkType.EVM) {
        const estimedGas = await merkledropContract.estimateGas.claim(...args);
        const _response: TransactionResponse = await merkledropContract.claim(...args, {
          gasLimit: calculateGasMargin(estimedGas),
        });
        await waitForTransaction(_response, 3);
        response = _response;
      } else if (chain?.network_type === NetworkType.HEDERA) {
        response = await hederaFn.claimAirdrop({
          account,
          address: merkledropContract.address,
          amount: data.amount.raw.toString(),
          proof: data.proof,
        });
      }

      if (!response) {
        throw new Error('Error in sending transaction,');
      }

      addTransaction(response, {
        summary: summary,
        claim: { recipient: account },
      });
      setHash(response.hash);

      mixpanel.track(MixPanelEvents.CLAIM_AIRDROP, {
        chainId: chainId,
        airdropType: airdropType,
      });
    } catch (err) {
      // we only care if the error is something _other_ than the user rejected the tx
      const _err = err as any;
      if (_err?.code !== 4001) {
        console.error(_err);
        setError(_err.message);
      }
    } finally {
      setAttempting(false);
    }
  };

  return { onClaim, onDimiss, hash, attempting, error };
}
