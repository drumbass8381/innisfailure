import { xprisma } from "@innisfailures/db";
import type { AgenticTradeIntentDraft } from "../types/trade-intent.js";

export async function persistTradeIntent(draft: AgenticTradeIntentDraft) {
  return xprisma.agenticTradeIntent.create({
    data: {
      agentLabel: draft.agentLabel,
      symbol: draft.symbol,
      side: draft.side,
      quantity: draft.quantity,
      notionalUsd: draft.notionalUsd,
      rationale: draft.rationale,
      signalIdsJson: JSON.stringify(draft.signalIds),
      status: "pending",
    },
  });
}

export async function persistMarketSignal(signal: {
  kind: string;
  sourceId?: string;
  agentLabel?: string;
  symbol?: string;
  score: number;
  payload: unknown;
  expiresAt?: Date;
}) {
  return xprisma.marketSignal.create({
    data: {
      kind: signal.kind,
      sourceId: signal.sourceId,
      agentLabel: signal.agentLabel,
      symbol: signal.symbol,
      score: signal.score,
      payloadJson: JSON.stringify(signal.payload),
      expiresAt: signal.expiresAt,
    },
  });
}
