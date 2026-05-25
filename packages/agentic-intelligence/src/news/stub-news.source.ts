import type { SemanticNewsDraft } from "../types/signals.js";
import type { INewsSource } from "./news-source.interface.js";

/**
 * Demo news source for local dev; replace with real feeds in production.
 */
export class StubNewsSource implements INewsSource {
  readonly name = "stub";

  async fetchSince(_since: Date): Promise<SemanticNewsDraft[]> {
    return [];
  }
}
