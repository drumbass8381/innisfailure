import { fetchJupiterQuote } from "./jupiter-quotes.js";

export type SolanaPaperPipelineInput = {
  jupiterQuoteApiBase: string;
  defaultSlippageBps: number;
  inputMint: string;
  outputMint: string;
  amount: string;
};

export type SolanaPaperPipelineResult = {
  ok: boolean;
  /** When paperMode is on we never hit mainnet RPC for sends; devnet URL is reserved for future simulateTransaction wiring. */
  rpcReservedForSimulation: string;
  quote: unknown;
  message: string;
};

/**
 * Paper Solana: Jupiter quote (read-only HTTP) + bookkeeping hook. No chain sends.
 * Call only when `SolanaChainSettings.paperMode` is true.
 */
export async function runPaperSolanaQuotePipeline(
  input: SolanaPaperPipelineInput,
): Promise<SolanaPaperPipelineResult> {
  const quote = await fetchJupiterQuote({
    apiBase: input.jupiterQuoteApiBase,
    inputMint: input.inputMint,
    outputMint: input.outputMint,
    amount: input.amount,
    slippageBps: input.defaultSlippageBps,
  });

  return {
    ok: true,
    rpcReservedForSimulation: "https://api.devnet.solana.com",
    quote,
    message: "paper_quote_ok",
  };
}

/** Symbol format: `solana:<inputMint>:<outputMint>:<amountRaw>` (amount in smallest units). */
export function parseSolanaPaperSymbol(
  symbol: string,
): { inputMint: string; outputMint: string; amount: string } | null {
  if (!symbol.startsWith("solana:")) return null;
  const rest = symbol.slice("solana:".length);
  const parts = rest.split(":");
  if (parts.length < 3) return null;
  const [inputMint, outputMint, ...amountParts] = parts;
  const amountRaw = amountParts.join(":");
  if (!inputMint || !outputMint || !amountRaw) return null;

  return { inputMint, outputMint, amount: amountRaw };
}
