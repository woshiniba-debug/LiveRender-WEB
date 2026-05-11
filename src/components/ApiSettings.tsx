"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Key, ExternalLink, Check, Eye, EyeOff, Trash2 } from "lucide-react";
import { ApiConfig, ProviderId, Region } from "@/lib/types";
import { API_PROVIDERS, CN_PROVIDERS, INTERNATIONAL_PROVIDERS } from "@/lib/apiProviders";

interface ApiSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig | null;
  onSave: (config: ApiConfig | null) => void;
}

export default function ApiSettings({ isOpen, onClose, config, onSave }: ApiSettingsProps) {
  const [region, setRegion] = useState<Region>("cn");
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>("deepseek");
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [showKey, setShowKey] = useState(false);

  const resetToConfig = useCallback(() => {
    if (config) {
      const p = API_PROVIDERS[config.provider];
      setRegion(p.region);
      setSelectedProvider(config.provider);
      setApiKey(config.apiKey);
      setSelectedModel(config.model);
    } else {
      setRegion("cn");
      setSelectedProvider("deepseek");
      setApiKey("");
      setSelectedModel(API_PROVIDERS.deepseek.defaultModel);
    }
    setShowKey(false);
  }, [config]);

  useEffect(() => {
    if (isOpen) resetToConfig();
  }, [isOpen, resetToConfig]);

  const providers = region === "cn" ? CN_PROVIDERS : INTERNATIONAL_PROVIDERS;
  const currentProvider = API_PROVIDERS[selectedProvider];

  const handleRegionChange = (r: Region) => {
    setRegion(r);
    const list = r === "cn" ? CN_PROVIDERS : INTERNATIONAL_PROVIDERS;
    const first = list[0];
    setSelectedProvider(first.id);
    setSelectedModel(first.defaultModel);
    setApiKey("");
  };

  const handleProviderChange = (id: ProviderId) => {
    setSelectedProvider(id);
    setSelectedModel(API_PROVIDERS[id].defaultModel);
  };

  const handleSave = () => {
    if (!apiKey.trim()) return;
    onSave({ provider: selectedProvider, apiKey: apiKey.trim(), model: selectedModel });
    onClose();
  };

  const handleClear = () => {
    onSave(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[520px] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
              <Key className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">AI 模型配置</h2>
              <p className="text-xs text-gray-400">连接你自己的 AI API，生成真实效果</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {/* Region */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
              选择地区
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  id: "cn" as Region,
                  label: "🌏 国内用户",
                  sub: "DeepSeek · Kimi · 通义 · 智谱",
                },
                {
                  id: "international" as Region,
                  label: "🌍 海外用户",
                  sub: "OpenAI · Claude · Gemini",
                },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRegionChange(r.id)}
                  className={`rounded-xl border px-4 py-3 text-left transition-all ${
                    region === r.id
                      ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`text-sm font-medium ${region === r.id ? "text-indigo-700" : "text-gray-800"}`}>
                    {r.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-gray-400">{r.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Provider */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
              选择服务商
            </label>
            <div className="grid grid-cols-2 gap-2">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProviderChange(p.id)}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${
                    selectedProvider === p.id
                      ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-xl">{p.logo}</span>
                  <div className="min-w-0">
                    <div
                      className={`truncate text-sm font-medium ${
                        selectedProvider === p.id ? "text-indigo-700" : "text-gray-800"
                      }`}
                    >
                      {p.name}
                    </div>
                    <div className="truncate text-[11px] text-gray-400">{p.tagline}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
              选择模型
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              {currentProvider.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}{m.recommended ? " ⭐" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={currentProvider.apiKeyPlaceholder}
                autoComplete="off"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-11 font-mono text-sm text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 transition-colors hover:text-gray-600"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-gray-400">
              🔒 Key 仅保存在你的浏览器本地，不会上传到任何服务器
            </p>
          </div>

          {/* Getting Key Guide */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-800">
                📖 如何获取 {currentProvider.name} API Key
              </p>
              <a
                href={currentProvider.getKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
              >
                前往获取
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <ol className="space-y-2">
              {currentProvider.getKeySteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-blue-700">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-700">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            {currentProvider.freeInfo && (
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700 border border-green-100">
                <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
                {currentProvider.freeInfo}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div>
            {config && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
                清除配置
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              保存并连接
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
