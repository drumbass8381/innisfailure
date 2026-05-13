import {
  ExchangeAccountWithCredentials,
  getOrCreateDefaultOwnerUser,
  TBot,
  xprisma,
} from "@innisfailures/db";
import { logger } from "@innisfailures/logger";
import { BotProcessing } from "@innisfailures/processing";
import { BarSize } from "@innisfailures/types";
import { BotConfig, ExchangeConfig } from "../types.js";

/**
 * Save exchange accounts to DB if not exists
 * @param exchangesConfig - Exchange accounts configuration
 */
export async function createOrUpdateExchangeAccounts(exchangesConfig: Record<string, ExchangeConfig>) {
  const exchangeAccounts: ExchangeAccountWithCredentials[] = [];
  const owner = await getOrCreateDefaultOwnerUser();

  for (const [exchangeLabel, exchangeData] of Object.entries(exchangesConfig)) {
    let exchangeAccount = await xprisma.exchangeAccount.findFirst({
      where: {
        label: exchangeLabel,
      },
    });

    if (exchangeAccount) {
      logger.info(`Exchange account "${exchangeLabel}" found in DB. Updating credentials...`);

      exchangeAccount = await xprisma.exchangeAccount.update({
        where: {
          id: exchangeAccount.id,
        },
        data: {
          ...exchangeData,
          label: exchangeLabel,
          owner: {
            connect: {
              id: owner.id,
            },
          },
        },
      });

      logger.info(`Exchange account "${exchangeLabel}" updated`);
    } else {
      logger.info(`Exchange account "${exchangeLabel}" not found. Adding to DB...`);

      exchangeAccount = await xprisma.exchangeAccount.create({
        data: {
          ...exchangeData,
          label: exchangeLabel,
          owner: {
            connect: {
              id: owner.id,
            },
          },
        },
      });

      logger.info(`Exchange account "${exchangeLabel}" created`);
    }

    exchangeAccounts.push(exchangeAccount);
  }

  return exchangeAccounts;
}

type CreateOrUpdateBotOptions = {
  config: string;
  pair?: string;
  exchange?: string;
  timeframe?: BarSize;
};

export async function createOrUpdateBot<T = any>(
  strategyName: string,
  options: CreateOrUpdateBotOptions,
  botConfig: BotConfig<T>,
  exchangeAccounts: ExchangeAccountWithCredentials[],
): Promise<TBot> {
  const exchangeLabel = options.exchange || botConfig.exchange;
  const botType = botConfig.type || "Bot";
  const botName = botConfig.name || "Default bot";
  const botLabel = botConfig.label || "default";
  const botTemplate = strategyName || botConfig.template;
  const botTimeframe = options.timeframe || botConfig.timeframe || null;
  const botPair = options.pair || botConfig.pair;
  const executionVenue = botConfig.executionVenue ?? "CEX_CCXT";

  const exchangeAccount = exchangeAccounts.find((exchangeAccount) => exchangeAccount.label === exchangeLabel);
  if (!exchangeAccount) {
    throw new Error(`Exchange account with label "${exchangeLabel}" not found. Check the exchanges config file.`);
  }

  const owner = await getOrCreateDefaultOwnerUser();

  let bot = await xprisma.bot.custom.findFirst({
    where: {
      label: botLabel,
    },
  });

  if (bot) {
    logger.info(`Bot "${botLabel}" found in DB. Updating...`);

    bot = await xprisma.bot.custom.update({
      where: {
        id: bot.id,
      },
      data: {
        type: botType,
        name: botName,
        label: botLabel,
        template: botTemplate,
        timeframe: botTimeframe,
        symbol: botPair,
        executionVenue,
        settings: JSON.stringify(botConfig.settings),
        state: JSON.stringify({}), // resets bot state
        exchangeAccount: {
          connect: {
            id: exchangeAccount.id,
          },
        },
        owner: {
          connect: {
            id: owner.id,
          },
        },
      },
    });

    logger.info(`Bot "${botLabel}" updated`);
  } else {
    logger.info(`Bot "${botLabel}" not found. Adding to DB...`);
    bot = await xprisma.bot.custom.create({
      data: {
        type: botType,
        name: botName,
        label: botLabel,
        template: strategyName,
        timeframe: botTimeframe,
        symbol: botPair,
        executionVenue,
        settings: JSON.stringify(botConfig.settings),
        exchangeAccount: {
          connect: {
            id: exchangeAccount.id,
          },
        },
        owner: {
          connect: {
            id: owner.id,
          },
        },
      },
    });

    logger.info(`Bot "${botLabel}" created`);
  }

  return bot;
}

export async function startBot(botId: number) {
  const botProcessor = await BotProcessing.fromId(botId);
  await botProcessor.processStartCommand();

  await enableBot(botId);

  await botProcessor.placePendingOrders();
}

export async function enableBot(botId: number) {
  await xprisma.bot.custom.update({
    where: {
      id: botId,
    },
    data: {
      enabled: true,
    },
  });
}

export async function stopBot(botId: number) {
  const botProcessor = await BotProcessing.fromId(botId);
  await botProcessor.processStopCommand();

  await disableBot(botId);
}

export async function disableBot(botId: number) {
  await xprisma.bot.custom.update({
    where: {
      id: botId,
    },
    data: {
      enabled: false,
    },
  });
}

export async function resetProcessing(botId: number) {
  await xprisma.bot.custom.update({
    where: {
      id: botId,
    },
    data: {
      processing: false,
    },
  });
}
