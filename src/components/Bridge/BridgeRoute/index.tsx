import React, { useContext } from 'react';
import { Anchor } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Text } from 'src/components';
import { BridgePrioritizations } from '..';
import { Information, Informations, Route, StepDetail } from './styles';
import { BridgeRouteProps } from './types';

const BridgeRoute: React.FC<BridgeRouteProps> = (props) => {
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const { selected, steps, transactionType, estimatedToken, estimatedResult, min, gasCost } = props;
  return (
    <Route selected={selected}>
      <Box display="flex" justifyContent="space-between" alignItems="center" pb={30}>
        <Text color={'bridge.text'} fontSize={[24, 20]} fontWeight={600}>
          {t(`bridge.bridgePrioritizations.${BridgePrioritizations[transactionType]}`).toLocaleUpperCase()}
        </Text>

        <Button variant="primary" width={'fit-content'} padding={'8px'} height="30px" isDisabled={selected}>
          {selected ? t('bridge.bridgeRoute.selected') : t('bridge.bridgeRoute.clickToSelect')}
        </Button>
      </Box>
      <div>
        {steps.map((step, index) => {
          return (
            <Box key={index}>
              <Box display={'flex'} flexDirection={'row'} alignItems="center" pb={'0.5rem'}>
                <Anchor size={20} color={theme.bridge?.text} />
                <Text pl={18} color={'bridge.text'} fontSize={[16, 14]} fontWeight={600}>
                  {step.contractType}
                </Text>
              </Box>
              <StepDetail lastItem={index === steps.length - 1}>
                <Text color={'bridge.text'} fontSize={[16, 14]} fontWeight={400} pb={'0.2rem'}>
                  {t('bridge.bridgeRoute.singleTransaction')}
                </Text>
                {step.subSteps?.map((subStep, index) => {
                  return (
                    <Text pl={24} key={index} color={'bridge.text'} fontSize={[16, 14]} fontWeight={400} pb={'0.2rem'}>
                      {subStep}
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
          {t('bridge.bridgeRoute.estimatedToken', { token: estimatedToken })}
        </Text>
        <Text color={'bridge.text'} fontSize={[16, 14]} fontWeight={600}>
          {t('bridge.bridgeRoute.estimatedResult', { result: estimatedResult })}
        </Text>
      </Box>
      <Informations>
        <Information>
          <Text color="bridge.routeInfoColor" fontSize={[16, 14]} fontWeight={400}>
            {t('bridge.bridgeRoute.min', { minute: min })}
          </Text>
        </Information>
        <Information>
          <Text color="bridge.routeInfoColor" fontSize={[16, 14]} fontWeight={400}>
            {t('bridge.bridgeRoute.gasCost', { gasCost: gasCost })}
          </Text>
        </Information>
      </Informations>
    </Route>
  );
};

export default BridgeRoute;
