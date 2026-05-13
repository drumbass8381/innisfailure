/**
 * Where trade execution is routed. CEX path uses CCXT; Solana path is for DEX / Jito / memecoin flows.
 */
export const EXECUTION_VENUES = ["CEX_CCXT", "SOLANA_DEX"] as const;
export type ExecutionVenue = (typeof EXECUTION_VENUES)[number];
