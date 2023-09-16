import { useTranslation } from '@honeycomb-finance/shared';
import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { StyledLink } from 'src/components/Detail/styleds';
import { Card, CardButtons, CardTitle, DetailsButton, NumberId, Title, VoteButton } from './styleds';

export type ProposalStates =
  | 'pending'
  | 'active'
  | 'canceled'
  | 'defeated'
  | 'succeeded'
  | 'queued'
  | 'expired'
  | 'executed';

export interface GovernanceCardProps {
  id: string;
  title: string;
  to: string;
  status: ProposalStates;
}

const GovernanceCard = ({ id, title, to, status }: GovernanceCardProps) => {
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const bgColors = {
    vote: theme.warning,
    executed: theme.green2Gradient,
    defeated: theme.red3Gradient,
  };

  const btnColors = {
    vote: theme.orange1,
    executed: theme.success,
    defeated: theme.avaxRed,
  };

  return (
    <Card>
      <CardTitle>
        <NumberId>{id}.</NumberId>
        <Title>{title}</Title>
      </CardTitle>
      <CardButtons>
        <StyledLink href={to} style={{ width: '100%', textDecoration: 'none' }}>
          <DetailsButton variant="outline">{t('votePage.details')}</DetailsButton>
        </StyledLink>
        <VoteButton variant="primary" color={(btnColors as any)[status]} backgroundColor={(bgColors as any)[status]}>
          {status}
        </VoteButton>
      </CardButtons>
    </Card>
  );
};
export default GovernanceCard;
