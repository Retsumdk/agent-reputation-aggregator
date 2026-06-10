import { ReputationProvider, ReputationSource, Evidence, AgentIdentity } from '../types';

/**
 * Mock provider for testing and demonstration
 */
export class MockReputationProvider extends ReputationProvider {
  readonly source = ReputationSource.MOCK;

  async getEvidence(agentId: string): Promise<Evidence[]> {
    // Generate some deterministic mock data based on agentId
    const seed = agentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = (seed % 15) + 5;
    
    const evidence: Evidence[] = [];
    for (let i = 0; i < count; i++) {
      const val = ((seed + i * 13) % 100) / 100;
      evidence.push({
        id: `mock-ev-${agentId}-${i}`,
        source: this.source,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        metric: i % 2 === 0 ? 'task_success' : 'peer_review',
        value: val,
        weight: 0.5 + (i % 5) * 0.1,
        metadata: { info: 'Generated mock evidence' }
      });
    }
    
    return evidence;
  }

  async getAgentInfo(agentId: string): Promise<AgentIdentity | null> {
    return {
      id: agentId,
      name: `Agent ${agentId.slice(0, 4)}`,
      network: 'MockNet'
    };
  }
}
