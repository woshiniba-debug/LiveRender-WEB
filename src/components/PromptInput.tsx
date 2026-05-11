"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Sparkles, Wand2, Zap } from "lucide-react";
import { EXAMPLE_PROMPTS } from "@/lib/mockData";
import { ApiConfig } from "@/lib/types";
import { API_PROVIDERS } from "@/lib/apiProviders";

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  apiConfig: ApiConfig | null;
  onOpenSettings: () => void;
}

export default function PromptInput({
  onGenerate,
  isGenerating,
  apiConfig,
  onOpenSettings,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const provider = apiConfig ? API_PROVIDERS[apiConfig.provider] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt.trim());
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Mode badge */}
      <div className="border-b border-gray-100 px-5 py-3">
        {provider ? (
          <button
            onClick={onOpenSettings}
            className="flex w-full items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-left transition-colors hover:bg-green-100"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-xs font-medium text-green-700">
              {provider.logo} {provider.name} · {apiConfig?.model}
            </span>
            <span className="ml-auto text-[10px] text-green-500">更换 →</span>
          </button>
        ) : (
          <button
            onClick={onOpenSettings}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-left transition-all hover:border-amber-400 hover:bg-amber-100"
          >
            <Zap className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            <div className="min-w-0">
              <span className="block text-xs font-medium text-amber-700">
                Mock 模式（演示数据）
              </span>
              <span className="block text-[10px] text-amber-500">
                点击接入真实 AI · 支持 7 个主流模型
              </span>
            </div>
            <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-amber-500" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto p-5 flex-1">
        {/* Title */}
        <div>
          <h2 className="text-base font-semibold text-gray-900">描述你的网页</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            用自然语言描述，AI 即时为你生成完整落地页
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：帮我生成一个极简风格的咖啡店官网首页，主色调用棕褐色，要有温馨感..."
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-gray-200 select-none">
              ⌘ Enter
            </div>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{provider ? "AI 生成中..." : "Mock 生成中..."}</span>
              </>
            ) : (
              <>
                {provider ? (
                  <Wand2 className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>Generate</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-100" />
          <span className="text-[11px] font-medium text-gray-400">示例 Prompt</span>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        {/* Example prompts */}
        <div className="flex flex-col gap-2">
          {EXAMPLE_PROMPTS.map((example, i) => (
            <button
              key={i}
              onClick={() => setPrompt(example)}
              disabled={isGenerating}
              className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-gray-400 shadow-sm ring-1 ring-gray-100 group-hover:text-indigo-500">
                {i + 1}
              </span>
              <span className="text-sm leading-snug text-gray-600 group-hover:text-indigo-700">
                {example}
              </span>
            </button>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-auto rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 p-4 ring-1 ring-indigo-100">
          <p className="text-xs font-semibold text-indigo-800">💡 生成更好效果的技巧</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-indigo-600">
            描述越具体效果越好。可以说明行业、风格偏好（极简/商务/活泼）、目标用户、主色调等。
          </p>
        </div>
      </div>
    </div>
  );
}
