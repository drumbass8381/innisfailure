/**
 * Thin Jito Block Engine client (JSON-RPC `sendBundle`).
 * @see https://docs.jito.wtf/
 */
export type SendBundleParams = {
  transactionsBase64: string[];
};

export class JitoBlockEngineClient {
  constructor(private readonly baseUrl: string) {}

  async sendBundle(params: SendBundleParams): Promise<{ bundleId?: string; raw: unknown }> {
    const root = this.baseUrl.replace(/\/$/, "");
    const url = `${root}/api/v1/bundles`;
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "sendBundle",
      params: [params.transactionsBase64],
    };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const raw: unknown = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`Jito sendBundle HTTP ${res.status}: ${JSON.stringify(raw)}`);
    }
    const bundleId =
      typeof raw === "object" && raw !== null && "result" in raw
        ? String((raw as { result?: unknown }).result)
        : undefined;
    return { raw, bundleId };
  }
}
