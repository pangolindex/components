import { Token } from '@pangolindex/sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Text } from 'src/components';
import { useHederaTokenAssociated } from 'src/hooks/tokens/hedera';
import Title from '../../Title';
import { Wrapper } from '../../styleds';

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
