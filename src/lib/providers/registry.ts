import type { ProviderId } from "@/lib/types";
import type { ProviderStrategy } from "./base";
import { createOpenAICompatibleStrategy } from "./openai";
import { claudeStrategy } from "./claude";
import { geminiStrategy } from "./gemini";

/**
 * O(1) provider lookup. Adding a new provider = one line in this Map.
 *
 * The five OpenAI-compatible providers all share the same strategy factory
 * but are instantiated separately so each strategy knows its `id` for
 * provider-specific behaviour (e.g. JSON-mode support).
 */
export const PROVIDER_REGISTRY: ReadonlyMap<ProviderId, ProviderStrategy> =
  new Map<ProviderId, ProviderStrategy>([
    ["openai", createOpenAICompatibleStrategy("openai")],
    ["deepseek", createOpenAICompatibleStrategy("deepseek")],
    ["kimi", createOpenAICompatibleStrategy("kimi")],
    ["qwen", createOpenAICompatibleStrategy("qwen")],
    ["zhipu", createOpenAICompatibleStrategy("zhipu")],
    ["claude", claudeStrategy],
    ["gemini", geminiStrategy],
  ]);

export function getProvider(id: ProviderId): ProviderStrategy {
  const provider = PROVIDER_REGISTRY.get(id);
  if (!provider) throw new Error(`未知的 AI 提供商: ${id}`);
  return provider;
}
