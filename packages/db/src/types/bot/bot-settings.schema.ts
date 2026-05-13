import { z } from "zod";

// these params are passed to the context when running the bot template
export const ZBotSettings = z.record(z.string(), z.any());

export type TBotSettings = z.infer<typeof ZBotSettings>;
