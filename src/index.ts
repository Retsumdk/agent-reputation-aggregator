export * from './types';
export * from './core/aggregator';
export * from './core/algorithms';
export * from './providers/mock';
export * from './providers/aion';

import { ReputationAggregator } from './core/aggregator';
import { MockReputationProvider } from './providers/mock';
import { AionReputationProvider } from './providers/aion';

/**
 * Factory method to create a pre-configured aggregator with standard providers
 */
export function createStandardAggregator() {
  const aggregator = new ReputationAggregator();
  aggregator.registerProvider(new MockReputationProvider());
  aggregator.registerProvider(new AionReputationProvider());
  return aggregator;
}
