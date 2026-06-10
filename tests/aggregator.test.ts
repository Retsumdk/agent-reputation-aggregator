import { expect, test, describe } from "bun:test";
import { ReputationAggregator } from "../src/core/aggregator";
import { MockReputationProvider } from "../src/providers/mock";
import { ReputationSource } from "../src/types";

describe("ReputationAggregator", () => {
  test("should aggregate reputation from mock provider", async () => {
    const aggregator = new ReputationAggregator();
    aggregator.registerProvider(new MockReputationProvider());
    
    const summary = await aggregator.getReputation("test-agent-123");
    
    expect(summary.agentId).toBe("test-agent-123");
    expect(summary.evidenceCount).toBeGreaterThan(0);
    expect(summary.globalScore).toBeGreaterThanOrEqual(0);
    expect(summary.globalScore).toBeLessThanOrEqual(1);
    expect(summary.confidence).toBeGreaterThan(0);
    expect(summary.breakdown[ReputationSource.MOCK]).toBeGreaterThan(0);
  });

  test("should find trusted agents", async () => {
    const aggregator = new ReputationAggregator();
    aggregator.registerProvider(new MockReputationProvider());
    
    const agents = ["agent-a", "agent-b", "agent-c"];
    const trusted = await aggregator.findTrustedAgents(agents, 0.4);
    
    expect(trusted.length).toBeGreaterThanOrEqual(0);
    expect(trusted.length).toBeLessThanOrEqual(agents.length);
  });

  test("should use bayesian algorithm correctly", async () => {
    const aggregator = new ReputationAggregator({ algorithm: 'bayesian' });
    aggregator.registerProvider(new MockReputationProvider());
    
    const summary = await aggregator.getReputation("new-agent");
    // Bayesian average pulls low-evidence agents towards 0.5
    expect(summary.globalScore).toBeCloseTo(0.5, 0.1);
  });
});
