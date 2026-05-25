import type { SemanticNewsDraft } from "../types/signals.js";

/**
 * Pluggable news ingest (RSS, CryptoPanic, Bloomberg API, etc.).
 */
export interface INewsSource {
  readonly name: string;
  fetchSince(since: Date): Promise<SemanticNewsDraft[]>;
}
