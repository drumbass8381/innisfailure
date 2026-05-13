/**
 * Best-effort memecoin / thin-pool gates. Never a safety guarantee.
 */
export function passesMinLiquidityUsd(
  minLiquidityUsd: number | null | undefined,
  poolLiquidityUsd: number | null,
): boolean {
  if (minLiquidityUsd == null || minLiquidityUsd <= 0) return true;
  if (poolLiquidityUsd == null) return false;
  return poolLiquidityUsd >= minLiquidityUsd;
}

export function clampSlippageBps(requested: number, maxAllowed: number): number {
  return Math.min(Math.max(0, requested), maxAllowed);
}
