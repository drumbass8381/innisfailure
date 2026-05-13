import { z, ZodObject } from "zod";
import { zodToJsonSchema, type JsonSchema7Type } from "zod-to-json-schema";
import { BotTemplate } from "@innisfailures/bot-processor";
import { templates } from "@innisfailures/bot-templates";
import { customStrategies } from "@innisfailures/bot-templates/server";
import type { Context } from "../../../../utils/context.js";

type Options = {
  ctx: {
    user: NonNullable<Context["user"]>;
  };
};

type StrategyName = keyof typeof templates | string;
type StrategyInfo = { name: string; schema: JsonSchema7Type; isCustom: boolean } & Pick<
  BotTemplate<any>,
  "displayName" | "description" | "hidden" | "runPolicy" | "watchers" | "requiredHistory"
>;

// Helper function to check if the schema is a ZodObject
function isZodObject(schema: any): schema is ZodObject {
  // Using `instance of ZodObject` will not work because
  // in custom strategies the `z` is imported from a different package
  // TODO: Maybe export the `z` instance to allow importing it as `import { z } from "innisfailures";`

  return schema?._def?.typeName === "ZodObject";
}

export async function getStrategies({ ctx }: Options) {
  const strategies: Record<StrategyName, BotTemplate<any>> = {
    ...customStrategies,
    ...templates,
  };

  const result: Record<StrategyName, StrategyInfo> = {};
  for (const [strategyName, strategy] of Object.entries(strategies)) {
    const zodSchema = isZodObject(strategy.schema) ? strategy.schema : z.object({});

    result[strategyName] = {
      name: strategyName,
      schema: zodToJsonSchema(zodSchema as any),
      isCustom: strategyName in customStrategies,
      displayName: strategy.displayName,
      description: strategy.description,
      hidden: !!strategy.hidden,
      runPolicy: strategy.runPolicy,
      watchers: strategy.watchers,
      requiredHistory: strategy.requiredHistory,
    };
  }

  return result;
}
