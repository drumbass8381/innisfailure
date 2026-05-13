import { z } from "zod";

export const ZBotState = z.record(z.string(), z.any());

export type TBotState = z.infer<typeof ZBotState>;
