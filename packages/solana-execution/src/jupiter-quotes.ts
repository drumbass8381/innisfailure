export type JupiterQuoteParams = {
  apiBase: string;
  inputMint: string;
  outputMint: string;
  /** Raw amount in smallest units (string avoids precision loss). */
  amount: string;
  slippageBps: number;
};

/**
 * Fetches a Jupiter v6 quote. Callers should simulate transactions before landing.
 */
export async function fetchJupiterQuote(params: JupiterQuoteParams): Promise<unknown> {
  const base = params.apiBase.replace(/\/$/, "");
  const u = new URL(`${base}/quote`);
  u.searchParams.set("inputMint", params.inputMint);
  u.searchParams.set("outputMint", params.outputMint);
  u.searchParams.set("amount", params.amount);
  u.searchParams.set("slippageBps", String(params.slippageBps));
  const res = await fetch(u);
  const raw: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Jupiter quote HTTP ${res.status}: ${JSON.stringify(raw)}`);
  }
  return raw;
}
