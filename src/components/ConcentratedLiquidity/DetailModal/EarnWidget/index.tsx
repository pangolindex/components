import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Loader, Stat, Text, TransactionCompleted } from 'src/components';
import { useChainId } from 'src/hooks';
import { useConcLiqPositionFeesHook } from 'src/hooks/concentratedLiquidity/hooks';
import { usePool } from 'src/hooks/concentratedLiquidity/hooks/common';
import RemoveDrawer from './RemoveDrawer';
import { ClaimWrapper, RewardWrapper, Root, StatWrapper } from './styles';
import { EarnWidgetProps } from './types';

const EarnWidget: React.FC<EarnWidgetProps> = (props) => {
  const { position } = props;
  const { t } = useTranslation();
  const chainId = useChainId();
  const useConcLiqPositionFees = useConcLiqPositionFeesHook[chainId];
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState(false);
  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
  }
  const _error = null;
  const [isRemoveDrawerVisible, setShowRemoveDrawer] = useState(false);

  const [, pool] = usePool(position?.token0 ?? undefined, position?.token1 ?? undefined, position?.fee);
  // inverted is default false. We need to change it when we decide to show an inverted price
  // (inverted mean is; show everything(min, max, current price etc.) in base Token0/Token1 not Token1/Token0)
  const inverted = false;
  // fees
  const [feeValue0, feeValue1] = useConcLiqPositionFees(pool ?? undefined, position?.tokenId);
  const feeValueUpper = inverted ? feeValue0 : feeValue1;
  const feeValueLower = inverted ? feeValue1 : feeValue0;

  return (
    <ClaimWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text
          color="text1"
          fontSize={[22, 18]}
          fontWeight={500}
          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {t('common.earned')}
        </Text>

        <Button variant="primary" width="100px" height="30px" onClick={() => setShowRemoveDrawer(true)}>
          {t('common.remove')}
        </Button>
      </Box>

      {!attempting && !hash && (
        <Root>
          <Box mt={'6px'} flex="1" display="flex" flexDirection="column" justifyContent="center">
            <RewardWrapper>
              <StatWrapper>
                <Stat
                  title={t('earn.unclaimedReward', { symbol: `${position?.token0?.symbol}` })}
                  stat={feeValueUpper ? feeValueUpper?.toSignificant(4) : '-'}
                  titlePosition="top"
                  titleFontSize={12}
                  statFontSize={[24, 18]}
                  titleColor="text1"
                  statAlign="center"
                />
              </StatWrapper>

              <StatWrapper>
                <Stat
                  title={t('earn.unclaimedReward', { symbol: `${position?.token1?.symbol}` })}
                  stat={feeValueLower ? feeValueLower?.toSignificant(4) : '-'}
                  titlePosition="top"
                  titleFontSize={12}
                  statFontSize={[24, 18]}
                  titleColor="text1"
                  statAlign="center"
                />
              </StatWrapper>
            </RewardWrapper>

            <Box borderRadius={'8px'} bgColor="color3" mt={'12px'}>
              <Text p={'12px'} fontSize="13px" color="text1" textAlign="center">
                {t('earn.liquidityRemainsPool')}
              </Text>
            </Box>
          </Box>

          <Box my={'12px'}>
            <Button
              variant="primary"
              onClick={() => {
                console.log('onClick');
              }}
            >
              {_error ?? t('earn.claimReward', { symbol: 'PNG' })}
            </Button>
          </Box>
        </Root>
      )}

      <RemoveDrawer
        isOpen={isRemoveDrawerVisible}
        onClose={() => {
          setShowRemoveDrawer(false);
        }}
      />

      {attempting && !hash && <Loader size={100} label={` ${t('sarClaim.claiming')}...`} />}

      {hash && <TransactionCompleted onClose={wrappedOnDismiss} submitText={t('earn.rewardClaimed')} />}
    </ClaimWrapper>
  );
};

export default EarnWidget;
