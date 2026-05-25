import { getOrCreateDefaultOwnerUser, xprisma } from "@innisfailures/db";
import { logger } from "@innisfailures/logger";
import { getOrCreateSettings } from "@innisfailures/agentic-intelligence";
import { solanaSettingsLogFields } from "@innisfailures/solana-execution";

async function ensureDefaultPaperAssets(): Promise<void> {
  const count = await xprisma.paperAsset.count();
  if (count > 0) return;

  await xprisma.paperAsset.createMany({
    data: [
      { currency: "USDT", balance: 1_000_000 },
      { currency: "USD", balance: 1_000_000 },
      { currency: "BTC", balance: 50 },
      { currency: "ETH", balance: 500 },
    ],
  });
  logger.info("paper_assets_seeded");
}

/**
 * Ensures default infrastructure rows exist after migrations (Solana, orchestrator policy).
 */
export async function bootstrapInfrastructure(): Promise<void> {
  const owner = await getOrCreateDefaultOwnerUser();
  logger.info({ ownerId: owner.id }, "default_owner_user_ready");

  await ensureDefaultPaperAssets();

  const agentic = await getOrCreateSettings();
  logger.info(
    {
      enabled: agentic.enabled,
      newsEnabled: agentic.newsEnabled,
      whaleWatchingEnabled: agentic.whaleWatchingEnabled,
    },
    "agentic_intelligence_settings_ready",
  );

  let sol = await xprisma.solanaChainSettings.findFirst();
  if (!sol) {
    sol = await xprisma.solanaChainSettings.create({ data: {} });
  }
  logger.info(solanaSettingsLogFields(sol), "solana_chain_settings_ready");

  let pol = await xprisma.orchestratorPolicy.findFirst();
  if (!pol) {
    pol = await xprisma.orchestratorPolicy.create({ data: {} });
  }
  logger.info(
    {
      orchestratorPolicy: pol.name,
      llmEnabled: pol.llmEnabled,
      requireHumanApproval: pol.requireHumanApproval,
    },
    "orchestrator_policy_ready",
  );
}
