import { expect, test, describe } from "bun:test";
import * as index from "../src/index";

describe("agent-reputation-aggregator", () => {
  test("module loads and exports correctly", () => {
    expect(index.ReputationAggregator).toBeDefined();
    expect(index.ReputationAlgorithms).toBeDefined();
    expect(index.MockReputationProvider).toBeDefined();
    expect(index.createStandardAggregator).toBeDefined();
  });

  test("factory method creates aggregator with providers", () => {
    const aggregator = index.createStandardAggregator();
    expect(aggregator).toBeInstanceOf(index.ReputationAggregator);
  });
});
