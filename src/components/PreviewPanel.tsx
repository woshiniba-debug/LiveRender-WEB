"use client";

import { useState } from "react";
import {
  Code2,
  Eye,
  RefreshCw,
  AlertCircle,
  Wand2,
  Sparkles,
  Download,
  RotateCcw,
} from "lucide-react";
import { GenerateResult, TabType } from "@/lib/types";
import { exportHtml } from "@/lib/exportHtml";
import MockWebsite from "./MockWebsite";
import CodeViewer from "./CodeViewer";

interface PreviewPanelProps {
  result: GenerateResult | null;
  isGenerating: boolean;
  error: string | null;
  lastPrompt: string | null;
  onRegenerate: () => void;
}

export default function PreviewPanel({
  result,
  isGenerating,
  error,
  lastPrompt,
  onRegenerate,
}: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("preview");

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "preview", label: "Preview", icon: <Eye className="h-3.5 w-3.5" /> },
    { id: "code", label: "Code", icon: <Code2 className="h-3.5 w-3.5" /> },
  ];

  const handleDownload = () => {
    if (result) exportHtml(result.template);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:rounded-2xl">
      {/* Browser chrome */}
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        {/* Traffic light dots */}
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400 sm:h-3 sm:w-3" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400 sm:h-3 sm:w-3" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400 sm:h-3 sm:w-3" />
        </div>

        {/* URL bar — hidden on small mobile */}
        <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs text-gray-400 ring-1 ring-gray-200 sm:flex">
          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
          <span className="truncate">
            {result
              ? `preview.aiwebdesigner.app/${result.template.name?.toLowerCase().replace(/\s+/g, "-")}`
              : "preview.aiwebdesigner.app"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {/* Badge */}
          {result?.isAiGenerated && (
            <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
              <Wand2 className="h-2.5 w-2.5" />
              <span className="hidden xs:inline">AI</span>
            </span>
          )}
          {result && !result.isAiGenerated && (
            <span className="hidden items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 sm:flex">
              <Sparkles className="h-2.5 w-2.5" />
              Mock
            </span>
          )}

          {result && <div className="hidden h-4 w-px bg-gray-200 sm:block" />}

          {/* Regenerate */}
          {lastPrompt && (
            <button
              onClick={onRegenerate}
              disabled={isGenerating}
              title={`重新生成：${lastPrompt}`}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-2.5"
            >
              <RotateCcw className={`h-3.5 w-3.5 shrink-0 ${isGenerating ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">重新生成</span>
            </button>
          )}

          {/* Download */}
          {result && (
            <button
              onClick={handleDownload}
              title="下载独立 HTML 文件"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-green-300 hover:bg-green-50 hover:text-green-700 sm:px-2.5"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">导出 HTML</span>
            </button>
          )}

          <div className="h-4 w-px bg-gray-200" />

          {/* Tabs */}
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-200/80 p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all sm:gap-1.5 sm:px-3 ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prompt sub-bar */}
      {lastPrompt && !isGenerating && (
        <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-3 py-2 sm:px-4">
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Prompt
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-gray-500">
            {lastPrompt}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="relative flex-1 overflow-hidden">
        {/* Generating overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-5 px-6 text-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-500" />
                <div className="absolute h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-400 [animation-direction:reverse]" />
                <RefreshCw className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">AI 正在构建你的网页…</p>
                <p className="mt-1 text-xs text-gray-400">正在生成结构、配色与内容</p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {["Navbar", "Hero", "Features", "CTA"].map((s) => (
                  <span key={s} className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-500">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !isGenerating && (
          <div className="flex h-full items-center justify-center p-6">
            <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-sm font-semibold text-red-800">生成失败</p>
              <p className="mt-2 text-xs leading-relaxed text-red-600">{error}</p>
              <p className="mt-3 text-[11px] text-red-400">
                请检查 API Key 是否正确，或网络是否可以访问该服务
              </p>
              {lastPrompt && (
                <button
                  onClick={onRegenerate}
                  className="mx-auto mt-4 flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  重试
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !isGenerating && !error && (
          <div className="flex h-full flex-col items-center justify-center gap-5 p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-100 h-20 w-20">
                <Sparkles className="h-9 w-9 text-indigo-400" />
              </div>
              <p className="text-base font-semibold text-gray-700">在左侧输入需求，点击 Generate</p>
              <p className="mt-1.5 text-sm text-gray-400">生成的网页预览将在此处展示</p>
            </div>
            <div className="w-full max-w-xs space-y-2.5 opacity-40">
              <div className="h-7 w-full rounded-lg bg-gray-100" />
              <div className="h-20 w-full rounded-xl bg-gray-100" />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (<div key={i} className="h-14 rounded-lg bg-gray-100" />))}
              </div>
              <div className="mx-auto h-10 w-2/3 rounded-lg bg-gray-100" />
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {["Navbar", "Hero", "Features", "CTA", "Footer"].map((s) => (
                <span key={s} className="rounded-full border border-dashed border-gray-200 px-3 py-1 text-xs text-gray-300">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && !isGenerating && !error && (
          <div className="h-full overflow-auto">
            {activeTab === "preview" ? (
              <MockWebsite template={result.template} />
            ) : (
              <div className="h-full p-3 sm:p-4">
                <CodeViewer code={result.code} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
