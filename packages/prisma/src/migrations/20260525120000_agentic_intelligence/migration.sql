-- CreateTable
CREATE TABLE "AgenticIntelligenceSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "newsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "whaleWatchingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "tickIntervalMs" INTEGER NOT NULL DEFAULT 60000,
    "minNewsRelevanceScore" REAL NOT NULL DEFAULT 0.55,
    "minWhaleUsdNotional" REAL NOT NULL DEFAULT 100000,
    "configJson" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SemanticNewsItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "externalId" TEXT,
    "source" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT,
    "publishedAt" DATETIME NOT NULL,
    "symbolsJson" TEXT NOT NULL DEFAULT '[]',
    "embeddingJson" TEXT,
    "sentiment" REAL,
    "relevanceScore" REAL,
    "ingestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WhaleWalletWatch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chain" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "label" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "minUsdAlert" REAL,
    "tagsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WhaleActivityEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "watchId" INTEGER NOT NULL,
    "txSignature" TEXT,
    "direction" TEXT NOT NULL,
    "tokenSymbol" TEXT,
    "amountUsd" REAL,
    "amountRaw" TEXT,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "WhaleActivityEvent_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "WhaleWalletWatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketSignal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kind" TEXT NOT NULL,
    "sourceId" TEXT,
    "agentLabel" TEXT,
    "symbol" TEXT,
    "score" REAL NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME
);

-- CreateTable
CREATE TABLE "AgenticTradeIntent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agentLabel" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "quantity" REAL,
    "notionalUsd" REAL,
    "rationale" TEXT NOT NULL,
    "signalIdsJson" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "SemanticNewsItem_externalId_key" ON "SemanticNewsItem"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "WhaleWalletWatch_chain_address_key" ON "WhaleWalletWatch"("chain", "address");
