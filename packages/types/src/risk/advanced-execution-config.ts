/**
 * Optional advanced execution / risk configuration (Phase 2b).
 * Wired incrementally by venues and the orchestrator.
 */
export type DynamicSlippageModel = "fixed" | "vol_scaled";

export interface KillSwitchConfig {
  maxDailyLossUsd?: number;
  maxErrorRatePerMinute?: number;
  pauseOnRpcUnhealthy?: boolean;
}

export interface InventorySkewTarget {
  /** Target net delta in base units, if applicable */
  targetDeltaBase?: number;
  maxAbsSkewBase?: number;
}
