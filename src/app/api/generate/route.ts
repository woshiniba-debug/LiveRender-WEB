import { NextRequest, NextResponse } from "next/server";
import { MockTemplate } from "@/lib/types";

const SYSTEM_PROMPT = `You are an expert web designer AI. The user will describe a website in natural language (possibly Chinese or English). Analyze the description and return a JSON object for a website landing page template.

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

function safeParseJson(text: string): MockTemplate {
  const cleaners = [
    (s: string) => s,
    (s: string) => {
      const m = s.match(/```(?:json)?\s*([\s\S]*?)```/);
      return m ? m[1].trim() : s;
    },
    (s: string) => {
      const start = s.indexOf("{");
      const end = s.lastIndexOf("}");
      return start !== -1 && end !== -1 ? s.slice(start, end + 1) : s;
    },
  ];

  for (const clean of cleaners) {
    try {
      return JSON.parse(clean(text)) as MockTemplate;
    } catch {
      // try next cleaner
    }
  }
  throw new Error("无法解析 AI 返回的 JSON，请重试");
}

function normalizeTemplate(raw: MockTemplate): MockTemplate {
  return {
    name: raw.name || "Generated Page",
    heroTitle: raw.heroTitle || "Welcome",
    heroSubtitle: raw.heroSubtitle || "A beautiful website, generated just for you.",
    ctaText: raw.ctaText || "Get Started",
    navItems: Array.isArray(raw.navItems) && raw.navItems.length > 0
      ? raw.navItems.slice(0, 6)
      : ["Home", "About", "Services", "Pricing", "Contact"],
    primaryColor: /^#[0-9a-f]{6}$/i.test(raw.primaryColor ?? "") ? raw.primaryColor : "#6366F1",
    accentColor: /^#[0-9a-f]{6}$/i.test(raw.accentColor ?? "") ? raw.accentColor : "#8B5CF6",
    features: Array.isArray(raw.features)
      ? raw.features.slice(0, 3).map((f) => ({
          icon: f.icon || "✨",
          title: f.title || "Feature",
          description: f.description || "",
        }))
      : [],
  };
}

// ─── Provider callers ─────────────────────────────────────────────────────────

async function callOpenAICompatible(
  prompt: string,
  apiKey: string,
  model: string,
  provider: string
) {
  const baseUrls: Record<string, string> = {
    openai: "https://api.openai.com/v1",
    deepseek: "https://api.deepseek.com/v1",
    kimi: "https://api.moonshot.cn/v1",
    qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    zhipu: "https://open.bigmodel.cn/api/paas/v4",
  };

  const baseUrl = baseUrls[provider] ?? "https://api.openai.com/v1";
  const supportsJsonMode = ["openai", "deepseek", "qwen"].includes(provider);

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  };

  if (supportsJsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `API 错误 ${res.status}`);
  }

  const data = await res.json() as { choices: { message: { content: string } }[] };
  return safeParseJson(data.choices[0].message.content);
}

async function callClaude(prompt: string, apiKey: string, model: string) {
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
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `API 错误 ${res.status}`);
  }

  const data = await res.json() as { content: { text: string }[] };
  return safeParseJson(data.content[0].text);
}

async function callGemini(prompt: string, apiKey: string, model: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `API 错误 ${res.status}`);
  }

  const data = await res.json() as {
    candidates: { content: { parts: { text: string }[] } }[];
  };
  return safeParseJson(data.candidates[0].content.parts[0].text);
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      prompt?: string;
      provider?: string;
      apiKey?: string;
      model?: string;
    };

    const { prompt, provider, apiKey, model } = body;

    if (!prompt || !provider || !apiKey || !model) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    let raw: MockTemplate;

    if (provider === "claude") {
      raw = await callClaude(prompt, apiKey, model);
    } else if (provider === "gemini") {
      raw = await callGemini(prompt, apiKey, model);
    } else {
      raw = await callOpenAICompatible(prompt, apiKey, model, provider);
    }

    return NextResponse.json({ template: normalizeTemplate(raw) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
