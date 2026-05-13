-- CreateTable
CREATE TABLE "SolanaChainSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rpcUrl" TEXT NOT NULL DEFAULT 'https://api.mainnet-beta.solana.com',
    "jitoBlockEngineUrl" TEXT,
    "jupiterQuoteApiBase" TEXT NOT NULL DEFAULT 'https://quote-api.jup.ag/v6',
    "maxTipLamports" TEXT NOT NULL DEFAULT '0',
    "defaultSlippageBps" INTEGER NOT NULL DEFAULT 50,
    "minLiquidityUsd" REAL,
    "jitoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "memecoinModeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OrchestratorPolicy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'default',
    "llmEnabled" BOOLEAN NOT NULL DEFAULT false,
    "requireHumanApproval" BOOLEAN NOT NULL DEFAULT true,
    "globalMaxDailyLossUsd" REAL,
    "configJson" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AgentProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "symbolOrScope" TEXT NOT NULL,
    "strategyTemplate" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "maxNotionalUsd" REAL,
    "configJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PolicyAuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" TEXT NOT NULL,
    "actionJson" TEXT NOT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_label_key" ON "AgentProfile"("label");
