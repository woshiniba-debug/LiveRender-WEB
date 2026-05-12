export interface MockTemplate {
  id?: string;
  name: string;
  description?: string;
  keywords?: string[];
  primaryColor: string;
  accentColor: string;
  heroTitle: string;
  heroSubtitle: string;
  features: Feature[];
  ctaText: string;
  navItems: string[];
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export type TabType = "preview" | "code";

export interface HistoryEntry {
  id: string;
  prompt: string;
  result: GenerateResult;
  createdAt: number;
}

export interface GenerateResult {
  template: MockTemplate;
  code: string;
  timestamp: number;
  isAiGenerated?: boolean;
  providerName?: string;
}

// ─── API Types ────────────────────────────────────────────────────────────────

export type Region = "cn" | "international";

export type ProviderId =
  | "deepseek"
  | "kimi"
  | "qwen"
  | "zhipu"
  | "openai"
  | "claude"
  | "gemini";

export interface ProviderModel {
  id: string;
  name: string;
  recommended?: boolean;
}

export interface ApiProvider {
  id: ProviderId;
  name: string;
  logo: string;
  region: Region;
  tagline: string;
  models: ProviderModel[];
  defaultModel: string;
  apiKeyPlaceholder: string;
  getKeyUrl: string;
  getKeySteps: string[];
  freeInfo?: string;
}

export interface ApiConfig {
  provider: ProviderId;
  apiKey: string;
  model: string;
}
