import { Box, Button, Text } from '@honeycomb-finance/core';
import { useTranslation } from '@honeycomb-finance/shared';
import { useHederaTokenAssociated } from '@honeycomb-finance/state-hooks';
import { Token } from '@pangolindex/sdk';
import React from 'react';
import Title from 'src/components/Title';
import { Wrapper } from '../../Title/styleds';

interface Props {
  title?: string;
  token: Token;
  logo: string;
}

export default function Associate({ title, token, logo }: Props) {
  const { t } = useTranslation();
  const { associate, isLoading: isLoadingAssociate } = useHederaTokenAssociated(token.address, token.symbol);
  return (
    <Wrapper>
      <Title title={title ?? `Claim ${token.symbol}`} logo={logo} />
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="150px" flex={1}>
        <Text fontSize={16} fontWeight={500} lineHeight="18px" color="text10">
          You first need to associate {token.symbol} token on your hashpack wallet.
        </Text>
      </Box>
      <Button variant="primary" color="black" height="46px" onClick={associate} isDisabled={isLoadingAssociate}>
        {isLoadingAssociate ? t('common.loading') : t('pool.associate')}
      </Button>
    </Wrapper>
  );
}
