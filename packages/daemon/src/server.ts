import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "@innisfailures/trpc";
import { createContext } from "./trpc.js";
import { registerHubApi } from "./hub-api.js";

// Path to the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type CreateServerOptions = {
  frontendDistPath: string;
  port: number;
  host: string;
};

/**
 * Creates and configures a Fastify server instance with specified options.
 *
 * @param params - The options for creating the server.
 */
export const createServer = (params: CreateServerOptions) => {
  const fastify = Fastify({
    logger: false, // Set to true to enable logging
    maxParamLength: 1000,
  });
  const staticDir = path.join(__dirname, params.frontendDistPath);

  fastify.register(fastifyCors, {
    origin: true,
  });

  fastify.register(fastifyStatic, {
    root: staticDir,
    prefix: "/", // optional: default '/'
  });

  fastify.register(fastifyTRPCPlugin, {
    prefix: "/api/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
    },
  });

  void registerHubApi(fastify);

  const indexHtmlPath = path.join(staticDir, "index.html");

  fastify.setNotFoundHandler(async (request, reply) => {
    const url = request.url.split("?")[0] ?? "";

    if (url.startsWith("/api/")) {
      return reply.status(404).send({ message: "Not Found" });
    }

    const hasFileExtension = /\.[a-z0-9]+$/i.test(url);
    if (hasFileExtension && !url.endsWith(".html")) {
      return reply.status(404).send("Not Found");
    }

    if (!fs.existsSync(indexHtmlPath)) {
      return reply.status(404).send("Not Found");
    }

    const html = fs.readFileSync(indexHtmlPath, "utf8");
    return reply.type("text/html").send(html);
  });

  return {
    app: fastify,
    server: fastify.server,
    listen: async () => {
      await fastify.listen({ port: params.port, host: params.host });
    },
    close: async () => {
      await fastify.close();
    },
  };
};
