export interface ProposalDetail {
  target: string;
  functionSig: string;
  callData: string;
}

export interface ProposalData {
  id: string;
  title: string;
  description: string;
  proposer?: string;
  status: string;
  forCount: number;
  againstCount: number;
  startTime: number;
  endTime: number;
  startBlock?: number;
  details?: ProposalDetail[];
  canceled?: boolean;
  executed?: boolean;
  eta?: number;
}

export enum ProposalState {
  pending = 'pending',
  active = 'active',
  canceled = 'canceled',
  defeated = 'defeated',
  succeeded = 'succeeded',
  queued = 'queued',
  expired = 'expired',
  executed = 'executed',
}
