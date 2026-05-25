import type { WhaleTransferDraft } from "../types/signals.js";

/**
 * Pluggable on-chain / exchange whale feed (Helius, Nansen, Arkham, etc.).
 */
export interface IWhaleSource {
  readonly chain: string;
  pollTransfers(watches: Array<{ address: string; minUsdAlert?: number | null }>): Promise<WhaleTransferDraft[]>;
}
