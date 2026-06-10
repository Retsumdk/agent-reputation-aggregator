/**
 * Core types for the Agent Reputation Aggregator
 */

export enum ReputationSource {
  AION = 'AION',
  BOLT = 'BOLT',
  PROMPT_FORGE = 'PROMPT_FORGE',
  GITHUB = 'GITHUB',
  MOCK = 'MOCK',
  CUSTOM = 'CUSTOM'
}

export interface AgentIdentity {
  id: string;
  name?: string;
  network: string;
  publicKey?: string;
}

export interface Evidence {
  id: string;
  source: ReputationSource;
  timestamp: Date;
  metric: string;
  value: number; // 0.0 to 1.0
  weight: number; // Importance of this evidence
  metadata?: Record<string, any>;
}

export interface ReputationSummary {
  agentId: string;
  globalScore: number;
  confidence: number;
  evidenceCount: number;
  breakdown: Record<ReputationSource, number>;
  lastUpdated: Date;
  rank?: number;
}

export interface AggregationOptions {
  decayHalfLifeDays?: number; // How quickly evidence loses relevance
  minConfidenceThreshold?: number;
  providerWeights?: Partial<Record<ReputationSource, number>>;
  algorithm?: 'simple-average' | 'bayesian' | 'wilson-score';
}

export abstract class ReputationProvider {
  abstract readonly source: ReputationSource;
  abstract getEvidence(agentId: string): Promise<Evidence[]>;
  abstract getAgentInfo(agentId: string): Promise<AgentIdentity | null>;
}
