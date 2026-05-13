-- AlterTable
ALTER TABLE "Bot" ADD COLUMN "executionVenue" TEXT NOT NULL DEFAULT 'CEX_CCXT';

-- AlterTable
ALTER TABLE "SolanaChainSettings" ADD COLUMN "paperMode" BOOLEAN NOT NULL DEFAULT false;
