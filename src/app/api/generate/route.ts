import { NextRequest } from "next/server";
import type { ProviderId, StreamEvent, MockTemplate } from "@/lib/types";
import {
  extractJson,
  normalizeTemplate,
  safeParseTemplate,
} from "@/lib/providers/base";
import { getProvider } from "@/lib/providers/registry";

// Force Node runtime so AbortSignal + ReadableStream behave consistently.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface GenerateBody {
  prompt?: string;
  provider?: ProviderId;
  apiKey?: string;
  model?: string;
}

/**
 * Best-effort progressive parser: takes accumulated text from the AI,
 * extracts a JSON-ish slice, and attempts to parse top-level keys even
 * if the JSON is still truncated. Returns `null` when nothing parseable yet.
 */
function progressiveParse(text: string): Partial<MockTemplate> | null {
  const slice = extractJson(text);
  if (!slice.startsWith("{")) return null;

  // Try full parse first — fastest path.
  try {
    return JSON.parse(slice) as Partial<MockTemplate>;
  } catch {
    // Fall through to key-by-key best-effort.
  }

  // Greedy single-pass extraction of string fields that have already closed.
  const partial: Partial<MockTemplate> = {};
  const stringFields: (keyof MockTemplate)[] = [
    "name",
    "heroTitle",
    "heroSubtitle",
    "ctaText",
    "primaryColor",
    "accentColor",
  ];
  for (const field of stringFields) {
    const re = new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
    const m = slice.match(re);
    if (m) (partial[field] as string) = m[1];
  }
  return Object.keys(partial).length ? partial : null;
}

function sseEncode(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: NextRequest) {
  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return new Response(
      JSON.stringify({ error: "请求体不是有效的 JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { prompt, provider, apiKey, model } = body;
  if (!prompt || !provider || !apiKey || !model) {
    return new Response(
      JSON.stringify({ error: "缺少必要参数" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let strategy;
  try {
    strategy = getProvider(provider);
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "未知的 AI 提供商",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  // Bridge upstream abort (client disconnect) to provider fetch.
  const abortController = new AbortController();
  request.signal.addEventListener("abort", () => abortController.abort());

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let accumulated = "";
      let lastPartialKeys = 0;

      const safeEnqueue = (event: StreamEvent) => {
        try {
          controller.enqueue(encoder.encode(sseEncode(event)));
        } catch {
          // Controller already closed — ignore.
        }
      };

      try {
        for await (const chunk of strategy.stream({
          prompt,
          apiKey,
          model,
          signal: abortController.signal,
        })) {
          accumulated += chunk;
          safeEnqueue({ type: "delta", text: chunk });

          // Throttle progressive parsing: only emit when a new key shows up.
          const partial = progressiveParse(accumulated);
          if (partial) {
            const keyCount = Object.keys(partial).length;
            if (keyCount > lastPartialKeys) {
              lastPartialKeys = keyCount;
              safeEnqueue({ type: "partial", template: partial });
            }
          }
        }

        // Final parse + normalize. Throws on malformed JSON.
        const raw = safeParseTemplate(accumulated);
        const template = normalizeTemplate(raw);
        safeEnqueue({ type: "done", template });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.name === "AbortError"
              ? "已取消"
              : err.message
            : "生成失败";
        safeEnqueue({ type: "error", message });
      } finally {
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
    cancel() {
      abortController.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
