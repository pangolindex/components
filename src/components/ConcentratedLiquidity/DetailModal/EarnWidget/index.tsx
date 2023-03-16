import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Loader, Stat, Text, TransactionCompleted } from 'src/components';
import Remove from './Remove';
import { ClaimWrapper, RewardWrapper, Root, StatWrapper } from './styles';
import { EarnWidgetProps } from './types';

const EarnWidget: React.FC<EarnWidgetProps> = () => {
  const { t } = useTranslation();
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState(false);
  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
  }
  const isSuperFarm = true;
  const _error = null;
  const [isRemoveDrawerVisible, setShowRemoveDrawer] = useState(false);
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

        {/* show unstak button */}
        <Button variant="primary" width="100px" height="30px" onClick={() => setShowRemoveDrawer(true)}>
          {t('common.remove')}
        </Button>
      </Box>

      {!attempting && !hash && (
        <Root>
          <Box mt={'6px'} flex="1" display="flex" flexDirection="column" justifyContent="center">
            <RewardWrapper isSuperFarm={isSuperFarm}>
              <StatWrapper>
                <Stat
                  title={t('earn.unclaimedReward', { symbol: 'PNG' })}
                  stat={'255.24'}
                  titlePosition="top"
                  titleFontSize={12}
                  statFontSize={[24, 18]}
                  titleColor="text1"
                  statAlign="center"
                />
              </StatWrapper>

              <StatWrapper>
                <Stat
                  title={t('earn.unclaimedReward', { symbol: 'USDC' })}
                  stat={'255.24'}
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

      <Remove
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
