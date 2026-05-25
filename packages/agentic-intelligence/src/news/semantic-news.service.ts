import { xprisma } from "@innisfailures/db";
import type { AgentScope } from "../types/trade-intent.js";
import type { ScoredMarketSignal, SemanticNewsDraft } from "../types/signals.js";
import { cosineSimilarity, embedText, parseEmbedding, serializeEmbedding } from "./news-embedding.js";
import type { INewsSource } from "./news-source.interface.js";

export type SemanticNewsServiceOptions = {
  minRelevanceScore: number;
  agents: AgentScope[];
};

export class SemanticNewsService {
  constructor(
    private readonly sources: INewsSource[],
    private readonly options: SemanticNewsServiceOptions,
  ) {}

  async ingestSince(since: Date): Promise<number> {
    let count = 0;
    for (const source of this.sources) {
      const drafts = await source.fetchSince(since);
      for (const draft of drafts) {
        await this.persistDraft(draft);
        count += 1;
      }
    }
    return count;
  }

  async persistDraft(draft: SemanticNewsDraft) {
    const text = [draft.headline, draft.summary, draft.body].filter(Boolean).join("\n");
    const embeddingJson = serializeEmbedding(embedText(text));
    const externalId =
      draft.externalId ?? `local:${draft.source}:${draft.headline.slice(0, 80).replace(/\s+/g, "_")}`;

    await xprisma.semanticNewsItem.upsert({
      where: { externalId },
      create: {
        externalId,
        source: draft.source,
        headline: draft.headline,
        summary: draft.summary,
        body: draft.body,
        publishedAt: draft.publishedAt,
        symbolsJson: JSON.stringify(draft.symbols),
        embeddingJson,
        sentiment: draft.sentiment,
      },
      update: {
        summary: draft.summary,
        body: draft.body,
        embeddingJson,
        sentiment: draft.sentiment,
        symbolsJson: JSON.stringify(draft.symbols),
      },
    });
  }

  /**
   * Score recent news against each enabled agent scope (symbol keywords + embedding similarity).
   */
  async scoreForAgents(since: Date): Promise<ScoredMarketSignal[]> {
    const items = await xprisma.semanticNewsItem.findMany({
      where: { publishedAt: { gte: since } },
      orderBy: { publishedAt: "desc" },
      take: 100,
    });

    const signals: ScoredMarketSignal[] = [];

    for (const item of items) {
      const symbols: string[] = JSON.parse(item.symbolsJson || "[]");
      const itemEmbedding = parseEmbedding(item.embeddingJson);
      const text = [item.headline, item.summary].filter(Boolean).join(" ");

      for (const agent of this.options.agents) {
        if (!agent.enabled) continue;

        const scopeVec = embedText(`${agent.symbolOrScope} ${text}`);
        const semanticScore = itemEmbedding
          ? cosineSimilarity(itemEmbedding, scopeVec)
          : this.keywordOverlap(agent.symbolOrScope, text);

        const symbolHit = symbols.some((s) => agent.symbolOrScope.includes(s)) ? 0.15 : 0;
        const sentimentBoost = item.sentiment != null ? Math.abs(item.sentiment) * 0.1 : 0;
        const score = Math.min(1, semanticScore * agent.newsWeight + symbolHit + sentimentBoost);

        if (score < this.options.minRelevanceScore) continue;

        signals.push({
          kind: "semantic_news",
          sourceId: `news:${item.id}`,
          agentLabel: agent.label,
          symbol: agent.symbolOrScope,
          score,
          payload: {
            kind: "semantic_news",
            headline: item.headline,
            summary: item.summary ?? undefined,
            sentiment: item.sentiment ?? undefined,
            matchedSymbols: symbols,
          },
        });

        await xprisma.semanticNewsItem.update({
          where: { id: item.id },
          data: { relevanceScore: score },
        });
      }
    }

    return signals;
  }

  private keywordOverlap(scope: string, text: string): number {
    const scopeTokens = scope
      .toLowerCase()
      .split(/[/:\s-]+/)
      .filter((t) => t.length > 2);
    const lower = text.toLowerCase();
    if (scopeTokens.length === 0) return 0;
    const hits = scopeTokens.filter((t) => lower.includes(t)).length;
    return hits / scopeTokens.length;
  }
}
