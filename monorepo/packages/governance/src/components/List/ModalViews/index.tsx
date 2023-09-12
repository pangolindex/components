import { AutoColumn, Box, CloseIcon, ColumnCenter, Text } from '@honeycomb/core';
import { ExternalLink, getEtherscanLink, useChainId, useTranslation } from '@honeycomb/shared';
import React, { useContext } from 'react';
import { ArrowUpCircle } from 'react-feather';
import styled, { ThemeContext, keyframes } from 'styled-components';
import Circle from 'src/assets/blue-loader.svg';

const ConfirmOrLoadingWrapper = styled.div`
  width: 100%;
  padding: 24px;
`;

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.img`
  animation: 2s ${rotate} linear infinite;
  width: 16px;
  height: 16px;
`;

const CustomLightSpinner = styled(Spinner)<{ size: string }>`
  height: ${({ size }) => size};
  width: ${({ size }) => size};
`;

const Wrapper = styled(Box)`
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
  justify-content: space-between;
`;

export function LoadingView({ children, onDismiss }: { children: any; onDismiss: () => void }) {
  const { t } = useTranslation();
  return (
    <ConfirmOrLoadingWrapper>
      <Wrapper>
        <div />
        <CloseIcon onClick={onDismiss} />
      </Wrapper>
      <ConfirmedIcon>
        <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
      </ConfirmedIcon>
      <AutoColumn gap="100px" justify={'center'}>
        {children}
        <Text fontWeight={400} fontSize={14}>
          {t('modalView.confirmTransaction')}
        </Text>
      </AutoColumn>
    </ConfirmOrLoadingWrapper>
  );
}

export function SubmittedView({
  children,
  onDismiss,
  hash,
}: {
  children: any;
  onDismiss: () => void;
  hash: string | undefined;
}) {
  const theme = useContext(ThemeContext);
  const chainId = useChainId();
  const { t } = useTranslation();

  return (
    <ConfirmOrLoadingWrapper>
      <Wrapper>
        <div />
        <CloseIcon onClick={onDismiss} />
      </Wrapper>
      <ConfirmedIcon>
        <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.primary1} />
      </ConfirmedIcon>
      <AutoColumn gap="100px" justify={'center'}>
        {children}
        {chainId && hash && (
          <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')} style={{ marginLeft: '4px' }}>
            <Text fontWeight={400} fontSize={14}>
              {t('modalView.viewTransaction')}
            </Text>
          </ExternalLink>
        )}
      </AutoColumn>
    </ConfirmOrLoadingWrapper>
  );
}
