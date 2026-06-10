import { Evidence, AggregationOptions, ReputationSource } from './types';

/**
 * Advanced scoring algorithms for reputation aggregation
 */
export class ReputationAlgorithms {
  /**
   * Simple weighted average of all evidence
   */
  static weightedAverage(evidence: Evidence[], options: AggregationOptions): number {
    if (evidence.length === 0) return 0.5;

    let totalWeight = 0;
    let weightedSum = 0;

    const now = new Date().getTime();
    const halfLifeMs = (options.decayHalfLifeDays || 30) * 24 * 60 * 60 * 1000;

    for (const item of evidence) {
      // Calculate time decay
      const age = now - new Date(item.timestamp).getTime();
      const timeWeight = Math.pow(0.5, age / halfLifeMs);
      
      // Calculate provider weight
      const providerWeight = options.providerWeights?.[item.source] ?? 1.0;
      
      const effectiveWeight = item.weight * timeWeight * providerWeight;
      
      weightedSum += item.value * effectiveWeight;
      totalWeight += effectiveWeight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }

  /**
   * Bayesian average to handle agents with very little evidence
   * Provides a "smoothed" score that pulls towards the mean (0.5) when evidence is low
   */
  static bayesianAverage(evidence: Evidence[], options: AggregationOptions): number {
    const C = 10; // Number of "typical" ratings
    const m = 0.5; // Prior mean reputation
    
    const sumValues = evidence.reduce((sum, e) => sum + e.value, 0);
    const n = evidence.length;
    
    return (C * m + sumValues) / (C + n);
  }

  /**
   * Lower bound of Wilson score confidence interval
   * Useful for ranking agents based on positive/negative interactions
   */
  static wilsonScore(evidence: Evidence[]): number {
    const n = evidence.length;
    if (n === 0) return 0;

    const positive = evidence.filter(e => e.value >= 0.7).length;
    const p = positive / n;
    const z = 1.96; // 95% confidence

    const denominator = 1 + z * z / n;
    const center = p + z * z / (2 * n);
    const spread = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));

    return (center - spread) / denominator;
  }

  /**
   * Calculate confidence based on evidence count and consistency
   */
  static calculateConfidence(evidence: Evidence[]): number {
    if (evidence.length === 0) return 0;
    
    // Quantity component (logarithmic growth)
    const quantity = Math.min(1.0, Math.log10(evidence.length + 1) / 2);
    
    // Consistency component (standard deviation)
    const values = evidence.map(e => e.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, 1 - stdDev * 2);

    return (quantity * 0.6) + (consistency * 0.4);
  }
}
