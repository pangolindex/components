import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'src/components';
import { AutoColumn } from 'src/components/Column';
import { useChainId } from 'src/hooks';
import useENS from 'src/hooks/useENS';
import { ExternalLink } from 'src/theme';
import { getEtherscanLink } from 'src/utils';
import { ContainerRow, Input, InputContainer, InputPanel, Wrapper } from './styleds';

export default function AddressInputPanel({
  id,
  value,
  onChange,
}: {
  id?: string;
  // the typed string value
  value: string;
  // triggers whenever the typed value changes
  onChange: (value: string) => void;
}) {
  const chainId = useChainId();

  const { t } = useTranslation();

  const { address, loading, name } = useENS(value);

  const handleInput = useCallback(
    (event) => {
      const input = event.target.value;
      const withoutSpaces = input.replace(/\s+/g, '');
      onChange(withoutSpaces);
    },
    [onChange],
  );

  const error = Boolean(value.length > 0 && !loading && !address);

  return (
    <InputPanel id={id}>
      <ContainerRow error={error}>
        <InputContainer>
          <AutoColumn gap="md">
            <Wrapper>
              <Text color="text2" fontWeight={500} fontSize={14}>
                {t('addressInputPanel.recipient')}
              </Text>
              {address && chainId && (
                <ExternalLink href={getEtherscanLink(chainId, name ?? address, 'address')} style={{ fontSize: '14px' }}>
                  {t('addressInputPanel.viewExplorer')}
                </ExternalLink>
              )}
            </Wrapper>
            <Input
              className="recipient-address-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder={t('addressInputPanel.walletAddress')}
              error={error}
              pattern="^(0x[a-fA-F0-9]{40})$"
              onChange={handleInput}
              value={value}
            />
          </AutoColumn>
        </InputContainer>
      </ContainerRow>
    </InputPanel>
  );
}
