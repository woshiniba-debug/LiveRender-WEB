"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import PromptInput from "@/components/PromptInput";
import PreviewPanel from "@/components/PreviewPanel";
import ApiSettings from "@/components/ApiSettings";
import { ApiConfig, GenerateResult } from "@/lib/types";
import { API_PROVIDERS } from "@/lib/apiProviders";
import { generateMockCode, matchTemplate } from "@/lib/mockData";

const STORAGE_KEY = "aiwd_api_config";

export default function Home() {
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load saved config on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ApiConfig;
        if (parsed.apiKey && parsed.provider && parsed.model) {
          setApiConfig(parsed);
        }
      }
    } catch {
      // ignore corrupted storage
    }
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

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setError(null);

    if (apiConfig?.apiKey) {
      // Real AI generation via server route
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

        const data = await res.json() as { template?: GenerateResult["template"]; error?: string };

        if (!res.ok) {
          throw new Error(data.error ?? "生成失败");
        }

        const template = data.template!;
        const code = generateMockCode(template);
        const providerName = API_PROVIDERS[apiConfig.provider]?.name;

        setResult({
          template,
          code,
          timestamp: Date.now(),
          isAiGenerated: true,
          providerName,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "生成失败，请检查 API Key 是否正确"
        );
      }
    } else {
      // Mock mode: simulate delay + use preset template
      await new Promise((resolve) =>
        setTimeout(resolve, 1200 + Math.random() * 500)
      );
      const template = matchTemplate(prompt);
      const code = generateMockCode(template);
      setResult({ template, code, timestamp: Date.now(), isAiGenerated: false });
    }

    setIsGenerating(false);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f8fafc]">
      <Header
        apiConfig={apiConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="w-[320px] shrink-0 overflow-hidden border-r border-gray-100 bg-white xl:w-[360px] flex flex-col">
          <PromptInput
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            apiConfig={apiConfig}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </aside>

        {/* Right panel */}
        <section className="flex flex-1 flex-col overflow-hidden p-4 xl:p-5">
          <PreviewPanel
            result={result}
            isGenerating={isGenerating}
            error={error}
          />
        </section>
      </main>

      {/* API Settings modal */}
      <ApiSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
