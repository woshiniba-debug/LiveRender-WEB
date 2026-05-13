"use client";

import { useCallback, useMemo, useState } from "react";
import Header from "@/components/Header";
import PromptInput from "@/components/PromptInput";
import PreviewPanel from "@/components/PreviewPanel";
import ApiSettings from "@/components/ApiSettings";
import MobileTabBar, { MobileTab } from "@/components/MobileTabBar";
import type { GenerateResult, HistoryEntry } from "@/lib/types";
import { useApiConfig } from "@/hooks/useApiConfig";
import { useHistory } from "@/hooks/useHistory";
import { useGenerate } from "@/hooks/useGenerate";

export default function Home() {
  const { config: apiConfig, save: saveConfig } = useApiConfig();
  const { entries: history, push: pushHistory } = useHistory(5);

  const handleSuccess = useCallback(
    (prompt: string, result: GenerateResult) => pushHistory(prompt, result),
    [pushHistory]
  );

  const { state, generate, regenerate, abort, restore } = useGenerate(
    apiConfig,
    { onSuccess: handleSuccess }
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("input");

  // Derive UI-shape props from the discriminated union — single source of truth.
  const view = useMemo(() => {
    switch (state.status) {
      case "generating":
        return {
          result: null as GenerateResult | null,
          isGenerating: true,
          error: null as string | null,
          lastPrompt: state.prompt,
          streamingTemplate: state.partial ?? null,
        };
      case "success":
        return {
          result: state.result,
          isGenerating: false,
          error: null as string | null,
          lastPrompt: state.prompt,
          streamingTemplate: null,
        };
      case "error":
        return {
          result: null as GenerateResult | null,
          isGenerating: false,
          error: state.message,
          lastPrompt: state.prompt,
          streamingTemplate: null,
        };
      case "idle":
      default:
        return {
          result: null as GenerateResult | null,
          isGenerating: false,
          error: null as string | null,
          lastPrompt: null as string | null,
          streamingTemplate: null,
        };
    }
  }, [state]);

  const handleGenerate = useCallback(
    (prompt: string) => {
      setMobileTab("preview");
      generate(prompt);
    },
    [generate]
  );

  const handleSelectHistory = useCallback(
    (entry: HistoryEntry) => {
      restore(entry.result, entry.prompt);
      setMobileTab("preview");
    },
    [restore]
  );

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#f8fafc]">
      <Header apiConfig={apiConfig} onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="flex flex-1 overflow-hidden">
        {/* Left panel — input */}
        <aside
          className={`
            flex flex-col overflow-hidden border-r border-gray-100 bg-white
            w-full md:w-[320px] xl:w-[360px] md:shrink-0
            ${mobileTab === "input" ? "flex" : "hidden"} md:flex
          `}
        >
          <PromptInput
            onGenerate={handleGenerate}
            isGenerating={view.isGenerating}
            apiConfig={apiConfig}
            onOpenSettings={() => setIsSettingsOpen(true)}
            history={history}
            onSelectHistory={handleSelectHistory}
          />
        </aside>

        {/* Right panel — preview */}
        <section
          className={`
            flex-col overflow-hidden p-3 sm:p-4 xl:p-5
            flex-1
            ${mobileTab === "preview" ? "flex" : "hidden"} md:flex
          `}
        >
          <PreviewPanel
            result={view.result}
            isGenerating={view.isGenerating}
            error={view.error}
            lastPrompt={view.lastPrompt}
            streamingTemplate={view.streamingTemplate}
            onRegenerate={regenerate}
            onCancel={abort}
          />
        </section>
      </main>

      {/* Mobile bottom tab bar */}
      <MobileTabBar
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        hasResult={!!view.result || !!view.error}
        isGenerating={view.isGenerating}
      />

      <ApiSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSave={saveConfig}
      />
    </div>
  );
}
