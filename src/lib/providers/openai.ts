import type { ProviderId } from "@/lib/types";
import {
  ProviderStrategy,
  ProviderCallContext,
  SYSTEM_PROMPT,
  readSseLines,
} from "./base";

// All OpenAI-compatible providers (DeepSeek, Kimi, Qwen, ZhiPu, OpenAI itself)
// share the `/chat/completions` shape with `stream: true`.
const BASE_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  deepseek: "https://api.deepseek.com/v1",
  kimi: "https://api.moonshot.cn/v1",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  zhipu: "https://open.bigmodel.cn/api/paas/v4",
};

// Providers known to support `response_format: { type: "json_object" }`.
const JSON_MODE_SUPPORT = new Set(["openai", "deepseek", "qwen"]);

export function createOpenAICompatibleStrategy(
  provider: Exclude<ProviderId, "claude" | "gemini">
): ProviderStrategy {
  return {
    id: provider,
    async *stream({ prompt, apiKey, model, signal }: ProviderCallContext) {
      const baseUrl = BASE_URLS[provider] ?? BASE_URLS.openai;
      const body: Record<string, unknown> = {
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      };
      if (JSON_MODE_SUPPORT.has(provider)) {
        body.response_format = { type: "json_object" };
      }

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal,
      });

      if (!res.ok) {
        const err = (await res
          .json()
          .catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(err?.error?.message ?? `API 错误 ${res.status}`);
      }

      for await (const data of readSseLines(res, signal)) {
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data) as {
            choices?: { delta?: { content?: string } }[];
          };
          const chunk = parsed.choices?.[0]?.delta?.content;
          if (chunk) yield chunk;
        } catch {
          // Skip malformed lines silently — they're usually keep-alives.
        }
      }
    },
  };
}
