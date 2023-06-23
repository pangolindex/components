import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, DoubleCurrencyLogo, Text } from 'src/components';
import { useChainId } from 'src/hooks';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import {
  BlackBox,
  BlackBoxContent,
  Card,
  Data,
  DesktopWrapper,
  HoverWrapper,
  MobileWrapper,
  OptionButton,
  OptionsWrapper,
  Panel,
  Row,
} from './styles';
import { PoolCardProps } from './types';

const PoolCard: React.FC<PoolCardProps> = (props) => {
  const { pool, onClick } = props;
  const chainId = useChainId();
  const currency0 = pool?.token0 && unwrappedToken(pool?.token0, chainId);
  const currency1 = pool?.token1 && unwrappedToken(pool?.token1, chainId);

  const { t } = useTranslation();

  return (
    <>
      <DesktopWrapper>
        <HoverWrapper>
          <Card onClick={onClick}>
            <Row>
              <Data>
                {currency0 && currency1 && <DoubleCurrencyLogo size={48} currency0={currency0} currency1={currency1} />}
                <Text color="color11" fontSize={28} fontWeight={700}>
                  {currency0?.symbol}-{currency1?.symbol}
                </Text>
                <BlackBox>
                  <BlackBoxContent color="color11" fontSize={18} fontWeight={500}>
                    {Number(pool?.fee) / 10 ** 4}%
                  </BlackBoxContent>
                </BlackBox>
                <BlackBox>
                  <BlackBoxContent color="color11" fontSize={18} fontWeight={500}>
                    {pool?.liquidity?.toString()}
                  </BlackBoxContent>
                </BlackBox>
              </Data>
            </Row>
          </Card>
        </HoverWrapper>
      </DesktopWrapper>
      <MobileWrapper>
        <Panel>
          <Box display="flex" alignItems="center" justifyContent="space-between" pb={'20px'}>
            <Box>
              <Text fontSize={24} fontWeight={500} color={'color11'}>
                {currency0?.symbol}-{currency1?.symbol}
              </Text>

              <Box pt={'10px'} display={'flex'} flexDirection={'row'}>
                <OptionsWrapper>
                  <OptionButton>
                    <Text>{Number(pool?.fee) / 10 ** 4}%</Text>
                  </OptionButton>
                  <BlackBox>
                    <Text p={'2px 6px'} textAlign={'center'} color={'color11'}>
                      {pool?.liquidity?.toString()}
                    </Text>
                  </BlackBox>
                </OptionsWrapper>
              </Box>
            </Box>

            {currency0 && currency1 && <DoubleCurrencyLogo size={48} currency0={currency0} currency1={currency1} />}
          </Box>

          <Box pt={'15px'}>
            <Button height="46px" variant="primary" borderRadius="4px" onClick={onClick}>
              {t('elixir.positionCard.seeDetails')}
            </Button>
          </Box>
        </Panel>
      </MobileWrapper>
    </>
  );
};

export default PoolCard;
