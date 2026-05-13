/** Snapshot shape compatible with Prisma `SolanaChainSettings` rows. */
export type SolanaChainSettingsSnapshot = {
  rpcUrl: string;
  jitoBlockEngineUrl: string | null;
  jupiterQuoteApiBase: string;
  maxTipLamports: string;
  defaultSlippageBps: number;
  minLiquidityUsd: number | null;
  jitoEnabled: boolean;
  memecoinModeEnabled: boolean;
  paperMode: boolean;
};

export function solanaSettingsLogFields(row: SolanaChainSettingsSnapshot) {
  return {
    rpcUrl: row.rpcUrl,
    jitoEnabled: row.jitoEnabled,
    jitoBlockEngineUrl: row.jitoBlockEngineUrl,
    jupiterQuoteApiBase: row.jupiterQuoteApiBase,
    maxTipLamports: row.maxTipLamports,
    defaultSlippageBps: row.defaultSlippageBps,
    minLiquidityUsd: row.minLiquidityUsd,
    memecoinModeEnabled: row.memecoinModeEnabled,
    paperMode: row.paperMode,
  };
}
