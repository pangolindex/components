import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Text } from 'src/components';
import { useDerivedBridgeInfo } from 'src/state/pbridge/hooks';
import { BridgePrioritizations, BridgeStep, Step } from 'src/state/pbridge/types';
import { Hidden, Visible } from 'src/theme/components';
import { Information, Informations, Route, StepDetail } from './styles';
import { BridgeRouteProps } from './types';

const BridgeRoute: React.FC<BridgeRouteProps> = (props) => {
  const { t } = useTranslation();
  const { transactionLoaderStatus } = useDerivedBridgeInfo();
  const {
    selected,
    steps = [],
    transactionType,
    toAmount,
    toToken,
    onSelectRoute,
    toAmountUSD,
    waitingTime,
    gasCostUSD,
  } = props;

  return (
    <Route selected={selected}>
      <Box display="flex" justifyContent="space-between" alignItems="center" pb={30}>
        <Text color={'bridge.text'} fontSize={[24, 20]} fontWeight={600}>
          {t(
            `bridge.bridgePrioritizations.${BridgePrioritizations[transactionType].toLowerCase()}`,
          ).toLocaleUpperCase()}
        </Text>

        <Button
          variant="primary"
          width={'fit-content'}
          padding={'8px'}
          height="30px"
          isDisabled={selected || transactionLoaderStatus}
          onClick={() => {
            onSelectRoute();
          }}
        >
          {selected ? (
            t('bridge.bridgeRoute.selected')
          ) : (
            <div>
              <Hidden upToSmall>{t('bridge.bridgeRoute.clickToSelect')}</Hidden>
              <Visible upToSmall>{t('common.select')}</Visible>
            </div>
          )}
        </Button>
      </Box>
      <div>
        {steps.map((step: Step, index) => {
          return (
            <Box key={index}>
              <Box display={'flex'} flexDirection={'row'} alignItems="center" pb={'0.5rem'}>
                <img src={(step as BridgeStep)?.bridge?.logo} width={20} height={20} />
                <Text pl={18} color={'bridge.text'} fontSize={[16, 14]} fontWeight={600}>
                  {(step as BridgeStep)?.bridge.name}
                </Text>
              </Box>
              <StepDetail lastItem={index === steps.length - 1}>
                <Text color={'bridge.text'} fontSize={[16, 14]} fontWeight={400} pb={'0.2rem'}>
                  {t('bridge.bridgeRoute.singleTransaction')}
                </Text>
                {(step as BridgeStep)?.includedSteps?.map((subStep, index) => {
                  return (
                    <Text pl={24} key={index} color={'bridge.text'} fontSize={[16, 14]} fontWeight={400} pb={'0.2rem'}>
                      {index + 1}. {subStep?.type ? subStep?.type[0].toUpperCase() + subStep?.type.slice(1) : 'Swap'} to{' '}
                      {subStep?.estimate?.toAmount} {subStep?.action?.toToken} via {subStep?.integrator}
                    </Text>
                  );
                })}
              </StepDetail>
            </Box>
          );
        })}
      </div>
      <Box pb={10}>
        <Text color={'bridge.text'} fontSize={[16, 14]} fontWeight={600} pb={'0.2rem'}>
          {t('bridge.bridgeRoute.estimatedToken', { token: `${toAmount} ${toToken}` })}
        </Text>
        <Text color={'bridge.text'} fontSize={[16, 14]} fontWeight={600}>
          {t('bridge.bridgeRoute.estimatedResult', { result: toAmountUSD })}
        </Text>
      </Box>
      <Informations>
        <Information>
          <Text color="bridge.routeInfoColor" fontSize={[16, 14]} fontWeight={400}>
            {waitingTime}
          </Text>
        </Information>
        {gasCostUSD && (
          <Information>
            <Text color="bridge.routeInfoColor" fontSize={[16, 14]} fontWeight={400}>
              {t('bridge.bridgeRoute.gasCost', { gasCost: gasCostUSD })}
            </Text>
          </Information>
        )}
      </Informations>
    </Route>
  );
};

export default BridgeRoute;
