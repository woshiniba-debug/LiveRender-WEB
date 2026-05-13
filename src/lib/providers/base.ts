import type { MockTemplate, ProviderId } from "@/lib/types";

export interface ProviderCallContext {
  prompt: string;
  apiKey: string;
  model: string;
  signal?: AbortSignal;
}

/**
 * Each provider strategy yields incremental text chunks as the upstream API
 * streams. Implementations may yield a single chunk (non-streaming) or many.
 *
 * The route handler aggregates chunks, attempts progressive JSON parsing,
 * and finally returns a fully normalized {@link MockTemplate}.
 */
export interface ProviderStrategy {
  readonly id: ProviderId | "openai-compatible";
  /**
   * Yields incremental text from the provider as it streams.
   * Should respect `ctx.signal` (AbortSignal) for cancellation.
   */
  stream(ctx: ProviderCallContext): AsyncIterable<string>;
}

export const SYSTEM_PROMPT = `You are an expert web designer AI. The user will describe a website in natural language (possibly Chinese or English). Analyze the description and return a JSON object for a website landing page template.

Return ONLY a valid JSON object with this exact structure — no markdown, no explanation, just raw JSON:
{
  "name": "short template name",
  "heroTitle": "compelling headline (≤20 chars if Chinese, ≤60 chars if English)",
  "heroSubtitle": "2–3 sentence subtitle that matches the brand voice and user's language",
  "ctaText": "action-oriented CTA button text (4–8 chars)",
  "navItems": ["Nav1", "Nav2", "Nav3", "Nav4", "Nav5"],
  "primaryColor": "#hexcolor",
  "accentColor": "#hexcolor",
  "features": [
    { "icon": "emoji", "title": "feature title", "description": "2-sentence feature description" },
    { "icon": "emoji", "title": "feature title", "description": "2-sentence feature description" },
    { "icon": "emoji", "title": "feature title", "description": "2-sentence feature description" }
  ]
}

Design guidelines:
- Match the language of user input (Chinese input → Chinese output, English input → English output)
- Choose brand-appropriate hex colors (warm browns for coffee/food, indigo/purple for SaaS/tech, red/orange for fitness/energy)
- accentColor should be a lighter or complementary shade of primaryColor
- navItems should be realistic page names for the website type
- features should be specific to the industry, not generic
- Make all copy compelling and professional`;

/**
 * Reads a fetch Response's body as an async-iterable of decoded text chunks.
 * Works in Edge / Node 18+ via the Web Streams API.
 */
export async function* readSseLines(
  response: Response,
  signal?: AbortSignal
): AsyncIterable<string> {
  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const onAbort = () => reader.cancel().catch(() => {});
  signal?.addEventListener("abort", onAbort);

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Split on SSE event boundary (double newline) — keep trailing partial.
      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        // Each block may have multiple `data:` lines.
        for (const line of block.split("\n")) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            yield trimmed.slice(5).trim();
          } else if (trimmed.startsWith("event:")) {
            // Ignore — we infer event type from the JSON payload.
          }
        }
      }
    }
    if (buffer.trim().startsWith("data:")) {
      yield buffer.trim().slice(5).trim();
    }
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}

/**
 * Attempt to parse the (possibly truncated) JSON accumulated so far.
 * Returns a partial template if some keys are decodable.
 */
export function extractJson(text: string): string {
  // Fast path: full JSON.
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  // Markdown fence path.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Object slice path.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1).trim();
  }
  return trimmed;
}

export function safeParseTemplate(text: string): MockTemplate {
  const candidate = extractJson(text);
  try {
    return JSON.parse(candidate) as MockTemplate;
  } catch {
    // Re-throw with stable message — route handler surfaces this.
    throw new Error("无法解析 AI 返回的 JSON，请重试");
  }
}

export function normalizeTemplate(raw: Partial<MockTemplate>): MockTemplate {
  return {
    name: raw.name || "Generated Page",
    heroTitle: raw.heroTitle || "Welcome",
    heroSubtitle:
      raw.heroSubtitle || "A beautiful website, generated just for you.",
    ctaText: raw.ctaText || "Get Started",
    navItems:
      Array.isArray(raw.navItems) && raw.navItems.length > 0
        ? raw.navItems.slice(0, 6)
        : ["Home", "About", "Services", "Pricing", "Contact"],
    primaryColor: /^#[0-9a-f]{6}$/i.test(raw.primaryColor ?? "")
      ? (raw.primaryColor as string)
      : "#6366F1",
    accentColor: /^#[0-9a-f]{6}$/i.test(raw.accentColor ?? "")
      ? (raw.accentColor as string)
      : "#8B5CF6",
    features: Array.isArray(raw.features)
      ? raw.features.slice(0, 3).map((f) => ({
          icon: f.icon || "✨",
          title: f.title || "Feature",
          description: f.description || "",
        }))
      : [],
  };
}
