import { logger } from "@innisfailures/logger";
import { xprisma } from "@innisfailures/db";
import { Platform } from "@innisfailures/bot";

export async function bootstrapPlatform() {
  const exchangeAccounts = await xprisma.exchangeAccount.findMany();
  logger.info(`🏛️  Loaded ${exchangeAccounts.length} exchange account(s)`);

  const bot = await xprisma.bot.custom.findFirst({
    where: {
      label: "default",
    },
    include: { exchangeAccount: true },
  });
  logger.info(`🤖 Default bot: ${bot ? bot.label : "none"}`);

  const platform = new Platform(exchangeAccounts);

  await platform.bootstrap();

  return platform;
}
