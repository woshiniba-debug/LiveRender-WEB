"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import PromptInput from "@/components/PromptInput";
import PreviewPanel from "@/components/PreviewPanel";
import ApiSettings from "@/components/ApiSettings";
import { ApiConfig, GenerateResult, HistoryEntry } from "@/lib/types";
import { API_PROVIDERS } from "@/lib/apiProviders";
import { generateMockCode, matchTemplate } from "@/lib/mockData";

const STORAGE_KEY = "aiwd_api_config";
const HISTORY_KEY = "aiwd_history";
const MAX_HISTORY = 5;

export default function Home() {
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig) as ApiConfig;
        if (parsed.apiKey && parsed.provider && parsed.model) {
          setApiConfig(parsed);
        }
      }
    } catch { /* ignore */ }

    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory) as HistoryEntry[]);
      }
    } catch { /* ignore */ }
  }, []);

  const handleSaveConfig = (config: ApiConfig | null) => {
    if (!config || !config.apiKey) {
      localStorage.removeItem(STORAGE_KEY);
      setApiConfig(null);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setApiConfig(config);
    }
  };

  const pushHistory = useCallback(
    (prompt: string, generateResult: GenerateResult) => {
      const entry: HistoryEntry = {
        id: String(Date.now()),
        prompt,
        result: generateResult,
        createdAt: Date.now(),
      };
      setHistory((prev) => {
        const next = [entry, ...prev.filter((e) => e.prompt !== prompt)].slice(
          0,
          MAX_HISTORY
        );
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch { /* ignore quota errors */ }
        return next;
      });
    },
    []
  );

  const runGenerate = useCallback(
    async (prompt: string) => {
      setIsGenerating(true);
      setError(null);
      setLastPrompt(prompt);

      if (apiConfig?.apiKey) {
        try {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt,
              provider: apiConfig.provider,
              apiKey: apiConfig.apiKey,
              model: apiConfig.model,
            }),
          });

          const data = await res.json() as {
            template?: GenerateResult["template"];
            error?: string;
          };

          if (!res.ok) throw new Error(data.error ?? "生成失败");

          const template = data.template!;
          const code = generateMockCode(template);
          const providerName = API_PROVIDERS[apiConfig.provider]?.name;
          const generated: GenerateResult = {
            template,
            code,
            timestamp: Date.now(),
            isAiGenerated: true,
            providerName,
          };
          setResult(generated);
          pushHistory(prompt, generated);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "生成失败，请检查 API Key 是否正确"
          );
        }
      } else {
        await new Promise((r) => setTimeout(r, 1200 + Math.random() * 500));
        const template = matchTemplate(prompt);
        const code = generateMockCode(template);
        const generated: GenerateResult = {
          template,
          code,
          timestamp: Date.now(),
          isAiGenerated: false,
        };
        setResult(generated);
        pushHistory(prompt, generated);
      }

      setIsGenerating(false);
    },
    [apiConfig, pushHistory]
  );

  const handleGenerate = (prompt: string) => runGenerate(prompt);

  const handleRegenerate = () => {
    if (lastPrompt) runGenerate(lastPrompt);
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    setResult(entry.result);
    setLastPrompt(entry.prompt);
    setError(null);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f8fafc]">
      <Header
        apiConfig={apiConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="flex w-[320px] shrink-0 flex-col overflow-hidden border-r border-gray-100 bg-white xl:w-[360px]">
          <PromptInput
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            apiConfig={apiConfig}
            onOpenSettings={() => setIsSettingsOpen(true)}
            history={history}
            onSelectHistory={handleSelectHistory}
          />
        </aside>

        {/* Right panel */}
        <section className="flex flex-1 flex-col overflow-hidden p-4 xl:p-5">
          <PreviewPanel
            result={result}
            isGenerating={isGenerating}
            error={error}
            lastPrompt={lastPrompt}
            onRegenerate={handleRegenerate}
          />
        </section>
      </main>

      <ApiSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
