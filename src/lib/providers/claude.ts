import {
  ProviderStrategy,
  ProviderCallContext,
  SYSTEM_PROMPT,
  readSseLines,
} from "./base";

export const claudeStrategy: ProviderStrategy = {
  id: "claude",
  async *stream({ prompt, apiKey, model, signal }: ProviderCallContext) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      const err = (await res
        .json()
        .catch(() => ({}))) as { error?: { message?: string } };
      throw new Error(err?.error?.message ?? `API 错误 ${res.status}`);
    }

    for await (const data of readSseLines(res, signal)) {
      try {
        const parsed = JSON.parse(data) as {
          type?: string;
          delta?: { type?: string; text?: string };
        };
        if (
          parsed.type === "content_block_delta" &&
          parsed.delta?.type === "text_delta" &&
          parsed.delta.text
        ) {
          yield parsed.delta.text;
        } else if (parsed.type === "message_stop") {
          return;
        }
      } catch {
        // Anthropic also sends `event: ping` lines with no JSON — ignore.
      }
    }
  },
};
