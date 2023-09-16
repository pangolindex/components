import { GovernanceDetail } from '@honeycomb-finance/governance';
import React from 'react';
import { useParams } from 'react-router-dom';

export type GovernanceDetailProps = Record<'id', 'string'>;

function GovernanceDetailV2() {
  const params = useParams<GovernanceDetailProps>();
  return (
    <div>
      <GovernanceDetail id={params?.id as any} />
    </div>
  );
}

export default GovernanceDetailV2;
