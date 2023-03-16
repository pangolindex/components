import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Drawer, Loader, NumberOptions, Text, TextInput, TransactionCompleted } from 'src/components';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { isEvmChain } from 'src/utils';
import { ButtonWrapper, RWrapper, RemoveWrapper } from './styles';
import { RemoveProps } from './types';

const Remove = ({ isOpen, onClose }: RemoveProps) => {
  const chainId = useChainId();
  const { account } = usePangolinWeb3();
  const toggleWalletModal = useWalletModalToggle();
  const hash = undefined;
  const attempting = false;
  const userLiquidity = true;
  const { t } = useTranslation();
  const [percentage, setPercentage] = useState<number>(100);

  function getApproveButtonVariant() {
    // if (approval === ApprovalState.APPROVED || signatureData !== null) {
    if (true) {
      return 'confirm';
    }
    return 'primary';
  }

  function getApproveButtonText() {
    // if (approval === ApprovalState.PENDING) {
    if (true) {
      return t('common.approving');
      // } else if (approval === ApprovalState.APPROVED || signatureData !== null) {
      //   return t('removeLiquidity.approved');
      // }
    }
    return t('common.approve');
  }

  const renderButton = () => {
    if (!account) {
      return (
        <Button variant="primary" onClick={toggleWalletModal} height="46px">
          {t('common.connectWallet')}
        </Button>
      );
    }

    return (
      <ButtonWrapper>
        {isEvmChain(chainId) && (
          <Box mr="5px" width="100%">
            <Button
              variant={getApproveButtonVariant()}
              onClick={() => {}}
              loading={attempting && !hash}
              loadingText={t('common.approving')}
              height="46px"
            >
              {getApproveButtonText()}
            </Button>
          </Box>
        )}

        <Box width="100%">
          <Button variant="primary" loading={attempting && !hash} loadingText={t('common.loading')} height="46px">
            {t('common.remove')}
          </Button>
        </Box>
      </ButtonWrapper>
    );
  };

  const removeLiquidity = () => {
    return (
      <RWrapper>
        {!attempting && !hash && (
          <>
            <Box flex={1}>
              <Box>
                <Box display="flex" flexDirection="column">
                  <TextInput
                    // value={formattedAmounts[Field.LIQUIDITY]}
                    addonAfter={
                      <Box display="flex" alignItems="center">
                        <Text color="text4" fontSize={[24, 18]}>
                          PGL
                        </Text>
                      </Box>
                    }
                    onChange={() => {
                      // onUserInput(value);
                    }}
                    fontSize={24}
                    isNumeric={true}
                    placeholder="0.00"
                    addonLabel={
                      account && (
                        <Text color="text2" fontWeight={500} fontSize={14}>
                          -
                        </Text>
                      )
                    }
                  />

                  <Box my="5px">
                    <NumberOptions
                      onChange={(value) => {
                        console.log(value);
                        setPercentage(value);
                        // onChangePercentage(value * 25);
                      }}
                      currentValue={percentage}
                      variant="step"
                      isPercentage={true}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box mt={0}>{renderButton()}</Box>
          </>
        )}

        {attempting && !hash && <Loader size={100} label={`${t('common.removingLiquidity')}...`} />}
        {hash && (
          <TransactionCompleted
            // onButtonClick={wrappedOnDismiss}
            buttonText={t('common.close')}
            submitText={t('common.removedLiquidity')}
            isShowButtton={true}
          />
        )}
      </RWrapper>
    );
  };

  const renderRemoveContent = () => {
    if (userLiquidity) {
      return removeLiquidity();
    } else {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Text color="text2" fontSize={16} fontWeight={500} textAlign="center">
            {t('common.noLiquidity')}
          </Text>
        </Box>
      );
    }
  };

  return (
    <Drawer title={t('common.remove')} isOpen={isOpen} onClose={onClose}>
      <RemoveWrapper>{renderRemoveContent()}</RemoveWrapper>
    </Drawer>
  );
};
export default Remove;
