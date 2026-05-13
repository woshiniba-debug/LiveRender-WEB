import {
  ProviderStrategy,
  ProviderCallContext,
  SYSTEM_PROMPT,
} from "./base";

// Gemini's streamGenerateContent returns a JSON array streamed chunk-by-chunk
// (NOT SSE). We parse incrementally by scanning for top-level objects.
export const geminiStrategy: ProviderStrategy = {
  id: "gemini",
  async *stream({ prompt, apiKey, model, signal }: ProviderCallContext) {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}` +
      `:streamGenerateContent?alt=sse&key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      signal,
    });

    if (!res.ok) {
      const err = (await res
        .json()
        .catch(() => ({}))) as { error?: { message?: string } };
      throw new Error(err?.error?.message ?? `API 错误 ${res.status}`);
    }

    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const onAbort = () => reader.cancel().catch(() => {});
    signal?.addEventListener("abort", onAbort);

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const block = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          for (const line of block.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            try {
              const parsed = payload ? JSON.parse(payload) : null;
              const candidates = (parsed as
                | { candidates?: { content?: { parts?: { text?: string }[] } }[] }
                | null
                | undefined)?.candidates;
              const text = candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) yield text;
            } catch {
              // ignore malformed lines
            }
          }
        }
      }
    } finally {
      signal?.removeEventListener("abort", onAbort);
    }
  },
};
