import { AbstractConnector } from '@web3-react/abstract-connector';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { WalletInfo } from 'src/constants';
import Option from '../Option';
import { ErrorButton, ErrorGroup, LoadingMessage, LoadingWrapper, PendingSection, StyledLoader } from './styles';

export default function PendingView({
  option,
  connector,
  error = false,
  setPendingError,
  tryActivation,
}: {
  option?: WalletInfo;
  connector?: AbstractConnector;
  error?: boolean;
  setPendingError: (error: boolean) => void;
  tryActivation: (connector: AbstractConnector, option: WalletInfo) => void;
}) {
  const { t } = useTranslation();

  return (
    <PendingSection>
      <LoadingMessage error={error}>
        <LoadingWrapper>
          {error ? (
            <ErrorGroup>
              <div>{t('walletModal.errorConnecting')}</div>
              <ErrorButton
                onClick={() => {
                  setPendingError(false);
                  connector && option && tryActivation(connector, option);
                }}
              >
                {t('walletModal.tryAgain')}
              </ErrorButton>
            </ErrorGroup>
          ) : (
            <>
              <StyledLoader />
              {t('walletModal.initializing')}
            </>
          )}
        </LoadingWrapper>
      </LoadingMessage>
      {option && (
        <Option
          id={`connect-${option.name}`}
          key={option.name}
          clickable={false}
          color={option.color}
          header={option.name}
          subheader={option.description}
          icon={option.iconName}
        />
      )}
    </PendingSection>
  );
}
