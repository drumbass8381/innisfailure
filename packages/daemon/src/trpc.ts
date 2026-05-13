import { type CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

import { getOrCreateDefaultOwnerUser } from "@innisfailures/db";
import { trpc, appRouter, type Context } from "@innisfailures/trpc";

// created for each request
export const createContext = async ({ req }: CreateFastifyContextOptions): Promise<Context> => {
  const password = req.headers.authorization;

  if (password !== process.env.ADMIN_PASSWORD) {
    return { user: null };
  }

  const user = await getOrCreateDefaultOwnerUser();

  return { user };
};

const createCaller = trpc.createCallerFactory(appRouter);

/** In-process tRPC caller (CLI). Uses the same default owner row as the HTTP API. */
export async function getTServer() {
  const user = await getOrCreateDefaultOwnerUser();
  return createCaller({ user });
}
