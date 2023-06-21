import { Contract } from '@ethersproject/contracts';
import { TransactionResponse } from '@ethersproject/providers';
import { hethers } from '@hashgraph/hethers';
import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { useWeb3React } from '@web3-react/core';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import CircleTick from 'src/assets/images/circleTick.svg';
import { Box, Button, Loader, Text, TextInput } from 'src/components';
import { network } from 'src/connectors';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { useActiveWeb3React } from 'src/hooks/useConnector';
import { useContract } from 'src/hooks/useContract';
import { useApplicationState } from 'src/state/papplication/atom';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { calculateGasMargin, waitForTransaction } from 'src/utils';
import { changeNetwork } from 'src/utils/wallet';
import Title from '../Title';
import { Wrapper } from '../styleds';
import RegistrationCompliant from './abis/registrationCompliant.json';
import { ErrorBox } from './styles';

interface Props {
  token: Token;
  logo: string;
}

export function useRegistrationCompliantContract(withSignerIfPossible?: boolean): Contract | null {
  const MULTISIGN_ADDRESS = '0xD912294B64B4e39Dd6252c471972711C8992A04b';
  return useContract(MULTISIGN_ADDRESS, RegistrationCompliant, withSignerIfPossible);
}

export default function HederaAirdrop({ token, logo }: Props) {
  const [recipient, setRecipient] = useState<string | undefined>(undefined);
  const [recipientEvmAddress, setRecipientEvmAddress] = useState<string | undefined>(undefined);
  const MESSAGE_SIGNATURE = `By signing this transaction, I hereby acknowledge that I am not a US resident or citizen. (Citizens or residents of the United States of America are not allowed to the token airdrop due to applicable law.)`;

  const [hash, setHash] = useState<string | null>(null);
  const [attempting, setAttempting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addTransaction = useTransactionAdder();

  const { account } = usePangolinWeb3();
  const theme = useContext(ThemeContext);
  const toggleWalletModal = useWalletModalToggle();
  const { wallets } = useApplicationState();
  const { connector } = useActiveWeb3React();
  const { activate, deactivate } = useWeb3React();
  const { t } = useTranslation();
  const currentChainId = useChainId();
  const { provider } = useLibrary();
  const registrationCompliantContract: Contract | null = useRegistrationCompliantContract(true);

  const handleChangeRecipient = useCallback(
    (recipient: string) => {
      setRecipient(recipient);
    },
    [setRecipient],
  );

  const onRegister = async () => {
    if (!registrationCompliantContract || !recipientEvmAddress || !account) return;
    setAttempting(true);
    try {
      const args = [recipientEvmAddress];

      // Check US compliance
      let signature = await provider?.execute('personal_sign', [MESSAGE_SIGNATURE, account]);

      const v = parseInt(signature.slice(130, 132), 16);

      // Ensure v is 27+ (generally 27|28)
      // Ledger and perhaps other signing methods utilize a 'v' of 0|1 instead of 27|28
      if (v < 27) {
        const vAdjusted = v + 27;
        signature = signature.slice(0, -2).concat(vAdjusted.toString(16));
      }
      args.push(signature);

      const estimatedGas = await registrationCompliantContract.estimateGas?.register(...args);
      const response: TransactionResponse = await registrationCompliantContract?.register(...args, {
        gasLimit: calculateGasMargin(estimatedGas),
      });
      await waitForTransaction(response, 3);

      addTransaction(response, {
        summary: 'Registered for airdrop',
        claim: { recipient: account },
      });
      setHash(response.hash);
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

  const isHederaIdValid = (hederaId: string): string | false => {
    if (
      hederaId &&
      hederaId?.toLowerCase()?.match(/^(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))(?:-([a-z]{5}))?$/g)
    ) {
      return hederaId;
    } else {
      return false;
    }
  };

  const toAddress = (accountId: string) => {
    return hethers.utils.getAddressFromAccount(accountId);
  };

  const isHederaAccountValid = useMemo(() => {
    const isValid = isHederaIdValid(recipient || '');
    if (typeof isValid === 'string') {
      const hederaEvmAddress = toAddress(recipient || '');
      setRecipientEvmAddress(hederaEvmAddress);
      return true;
    }
    return isValid;
  }, [recipient, setRecipientEvmAddress]);

  const handleButtonFujiClick = useCallback(() => {
    if (account) {
      changeNetwork({
        chain: CHAINS[ChainId.FUJI],
        connector: connector ?? network,
        wallets: Object.values(wallets),
        activate,
        deactivate,
      });
    } else {
      toggleWalletModal();
    }
  }, [account, connector, wallets, activate, deactivate, toggleWalletModal]);

  const onCleanUp = useCallback(() => {
    setAttempting(false);
    setError(null);
    setHash(null);
  }, []);

  const renderButton = () => {
    if (error)
      return (
        <Button variant="primary" onClick={onCleanUp}>
          Try Again
        </Button>
      );
    if (attempting || hash) return <></>;
    return currentChainId !== ChainId.FUJI ? (
      <Button variant="primary" onClick={handleButtonFujiClick}>
        {!account ? t('common.connectWallet') : 'CONNECT TO FUJI'}
      </Button>
    ) : (
      <Button isDisabled={!recipient || !isHederaAccountValid} variant="primary" onClick={onRegister}>
        Register
      </Button>
    );
  };

  const renderContent = () => {
    if (attempting) return <Loader size={100} />;
    if (error)
      return (
        <Box>
          <ErrorBox>
            <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
            <Text fontWeight={500} fontSize={16} color={'red1'} textAlign="center" style={{ width: '85%' }}>
              {error}
            </Text>
          </ErrorBox>
        </Box>
      );
    if (hash)
      return (
        <Box>
          <Box flex="1" display="flex" alignItems="center">
            <img src={CircleTick} alt="circle-tick" />
          </Box>
          <Text>Success</Text>
        </Box>
      );
    return (
      <Box>
        <Text fontSize={16} fontWeight={500} lineHeight="24px" color="text10" textAlign="center">
          Enter your Hedera address to register for airdrop
        </Text>
        <TextInput
          placeholder={t('bridge.bridgeInputsWidget.walletAddress')}
          value={recipient || ''}
          required
          onChange={(value) => {
            const withoutSpaces: string = value.replace(/\s+/g, '');
            handleChangeRecipient(withoutSpaces);
          }}
          addonLabel={
            recipient ? (
              !isHederaAccountValid && <Text color="warning">{t('bridge.bridgeInputsWidget.invalidAddress')}</Text>
            ) : (
              <Text color="error">{t('common.required')}</Text>
            )
          }
        />
      </Box>
    );
  };

  return (
    <Wrapper>
      <Title title={`${token?.symbol} Airdrop`} logo={logo} />
      <Box display="flex" alignItems="center" justifyContent="center" flexGrow={1} minWidth="150px">
        {renderContent()}
      </Box>
      {renderButton()}
    </Wrapper>
  );
}
