export interface ActivityMetadata {
  projectId?: string;
  submissionId?: string;
  listingId?: string;
  contributor?: string;
  curator?: string;
  buyer?: string;
  rewards?: ActivityToken[];
  paid?: ActivityToken[];
}

export interface ActivityToken {
  amount: bigint;
  decimals: number;
  symbol: string;
}
