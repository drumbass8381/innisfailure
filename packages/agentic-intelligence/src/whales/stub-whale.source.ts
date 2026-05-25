import type { WhaleTransferDraft } from "../types/signals.js";
import type { IWhaleSource } from "./whale-source.interface.js";

/** No-op whale poller until RPC/indexer integration is wired. */
export class StubWhaleSource implements IWhaleSource {
  readonly chain: string;

  constructor(chain = "solana") {
    this.chain = chain;
  }

  async pollTransfers(
    _watches: Array<{ address: string; minUsdAlert?: number | null }>,
  ): Promise<WhaleTransferDraft[]> {
    return [];
  }
}
