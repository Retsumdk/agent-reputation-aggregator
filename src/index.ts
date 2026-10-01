export * from './types.js';
export * from './core/aggregator.js';
export * from './core/algorithms.js';
export * from './providers/mock.js';
export * from './providers/aion.js';

import { ReputationAggregator } from './core/aggregator.js';
import { MockReputationProvider } from './providers/mock.js';
import { AionReputationProvider } from './providers/aion.js';

/**
 * Factory method to create a pre-configured aggregator with standard providers
 */
export function createStandardAggregator() {
  const aggregator = new ReputationAggregator();
  aggregator.registerProvider(new MockReputationProvider());
  aggregator.registerProvider(new AionReputationProvider());
  return aggregator;
}
