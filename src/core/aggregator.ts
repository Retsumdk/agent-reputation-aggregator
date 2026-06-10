import { 
  AgentIdentity, 
  Evidence, 
  ReputationProvider, 
  ReputationSummary, 
  AggregationOptions, 
  ReputationSource 
} from '../types';
import { ReputationAlgorithms } from './algorithms';

/**
 * Main engine for aggregating reputation across multiple providers
 */
export class ReputationAggregator {
  private providers: Map<ReputationSource, ReputationProvider> = new Map();
  private options: AggregationOptions;

  constructor(options: AggregationOptions = {}) {
    this.options = {
      decayHalfLifeDays: 30,
      minConfidenceThreshold: 0.1,
      algorithm: 'weighted-average',
      ...options
    };
  }

  /**
   * Register a new reputation data provider
   */
  registerProvider(provider: ReputationProvider): void {
    this.providers.set(provider.source, provider);
  }

  /**
   * Get a comprehensive reputation summary for an agent
   */
  async getReputation(agentId: string): Promise<ReputationSummary> {
    const allEvidence: Evidence[] = [];
    const breakdown: Record<ReputationSource, number> = {
      [ReputationSource.AION]: 0,
      [ReputationSource.BOLT]: 0,
      [ReputationSource.PROMPT_FORGE]: 0,
      [ReputationSource.GITHUB]: 0,
      [ReputationSource.MOCK]: 0,
      [ReputationSource.CUSTOM]: 0
    };

    // Fetch evidence from all registered providers in parallel
    const providerList = Array.from(this.providers.values());
    const results = await Promise.allSettled(
      providerList.map(p => p.getEvidence(agentId))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const source = providerList[index].source;
        const evidence = result.value;
        allEvidence.push(...evidence);
        
        if (evidence.length > 0) {
          breakdown[source] = ReputationAlgorithms.weightedAverage(evidence, this.options);
        }
      } else {
        console.error(`Provider ${providerList[index].source} failed:`, result.reason);
      }
    });

    let score = 0;
    switch (this.options.algorithm) {
      case 'bayesian':
        score = ReputationAlgorithms.bayesianAverage(allEvidence, this.options);
        break;
      case 'wilson-score':
        score = ReputationAlgorithms.wilsonScore(allEvidence);
        break;
      default:
        score = ReputationAlgorithms.weightedAverage(allEvidence, this.options);
    }

    const confidence = ReputationAlgorithms.calculateConfidence(allEvidence);

    return {
      agentId,
      globalScore: score,
      confidence,
      evidenceCount: allEvidence.length,
      breakdown,
      lastUpdated: new Date()
    };
  }

  /**
   * Batch process reputation for multiple agents
   */
  async getBatchReputation(agentIds: string[]): Promise<Map<string, ReputationSummary>> {
    const results = new Map<string, ReputationSummary>();
    
    // Use chunks to avoid overloading providers
    const chunkSize = 5;
    for (let i = 0; i < agentIds.length; i += chunkSize) {
      const chunk = agentIds.slice(i, i + chunkSize);
      const chunkPromises = chunk.map(id => this.getReputation(id));
      const chunkResults = await Promise.all(chunkPromises);
      
      chunkResults.forEach(res => results.set(res.agentId, res));
    }
    
    return results;
  }

  /**
   * Find agents that meet a specific reputation criteria
   */
  async findTrustedAgents(agentIds: string[], minScore: number = 0.8): Promise<string[]> {
    const summaries = await this.getBatchReputation(agentIds);
    return Array.from(summaries.values())
      .filter(s => s.globalScore >= minScore && s.confidence >= (this.options.minConfidenceThreshold ?? 0.1))
      .map(s => s.agentId);
  }
}
