import { ApiProvider, ProviderId } from "./types";

export const API_PROVIDERS: Record<ProviderId, ApiProvider> = {
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    logo: "🧠",
    region: "cn",
    tagline: "性价比最高，推荐首选",
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3", recommended: true },
      { id: "deepseek-reasoner", name: "DeepSeek R1（推理）" },
    ],
    defaultModel: "deepseek-chat",
    apiKeyPlaceholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    getKeyUrl: "https://platform.deepseek.com/api_keys",
    getKeySteps: [
      "访问 platform.deepseek.com 注册账号",
      "进入「API Keys」页面",
      "点击「创建 API Key」并复制",
    ],
    freeInfo: "新用户赠送免费额度，DeepSeek V3 价格极低",
  },
  kimi: {
    id: "kimi",
    name: "Kimi（月之暗面）",
    logo: "🌙",
    region: "cn",
    tagline: "擅长长文本和中文理解",
    models: [
      { id: "moonshot-v1-8k", name: "Moonshot 8K", recommended: true },
      { id: "moonshot-v1-32k", name: "Moonshot 32K" },
      { id: "moonshot-v1-128k", name: "Moonshot 128K" },
    ],
    defaultModel: "moonshot-v1-8k",
    apiKeyPlaceholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    getKeyUrl: "https://platform.moonshot.cn/console/api-keys",
    getKeySteps: [
      "访问 platform.moonshot.cn 注册账号",
      "进入「API Keys」页面",
      "点击「新建」创建 API Key 并复制",
    ],
    freeInfo: "新用户有免费试用额度",
  },
  qwen: {
    id: "qwen",
    name: "通义千问（Qwen）",
    logo: "🔮",
    region: "cn",
    tagline: "阿里云出品，稳定可靠",
    models: [
      { id: "qwen-plus", name: "Qwen Plus", recommended: true },
      { id: "qwen-turbo", name: "Qwen Turbo（快速）" },
      { id: "qwen-max", name: "Qwen Max（最强）" },
    ],
    defaultModel: "qwen-plus",
    apiKeyPlaceholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    getKeyUrl: "https://dashscope.console.aliyun.com/apiKey",
    getKeySteps: [
      "注册 / 登录阿里云账号",
      "访问 DashScope 控制台并开通服务",
      "在「API-KEY 管理」页面创建并复制 Key",
    ],
    freeInfo: "开通后赠送免费 Token 额度",
  },
  zhipu: {
    id: "zhipu",
    name: "智谱 AI（GLM）",
    logo: "⚡",
    region: "cn",
    tagline: "GLM-4-Flash 完全免费",
    models: [
      { id: "glm-4-flash", name: "GLM-4-Flash（免费）", recommended: true },
      { id: "glm-4-air", name: "GLM-4-Air" },
      { id: "glm-4", name: "GLM-4（最强）" },
    ],
    defaultModel: "glm-4-flash",
    apiKeyPlaceholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxx",
    getKeyUrl: "https://open.bigmodel.cn/usercenter/apikeys",
    getKeySteps: [
      "访问 open.bigmodel.cn 注册账号",
      "进入「API Keys」页面",
      "点击「创建」生成 API Key 并复制",
    ],
    freeInfo: "GLM-4-Flash 模型完全免费，无需充值",
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    logo: "🤖",
    region: "international",
    tagline: "Industry standard, most widely used",
    models: [
      { id: "gpt-4o-mini", name: "GPT-4o Mini (Recommended)", recommended: true },
      { id: "gpt-4o", name: "GPT-4o (Most Capable)" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo (Cheapest)" },
    ],
    defaultModel: "gpt-4o-mini",
    apiKeyPlaceholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    getKeyUrl: "https://platform.openai.com/api-keys",
    getKeySteps: [
      "Sign up at platform.openai.com",
      "Add billing information (pay-as-you-go)",
      "Go to API Keys → Create new secret key",
    ],
    freeInfo: "~$0.001 per request with GPT-4o Mini",
  },
  claude: {
    id: "claude",
    name: "Anthropic Claude",
    logo: "🧬",
    region: "international",
    tagline: "Best for code & reasoning tasks",
    models: [
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5 (Fast)", recommended: true },
      { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6 (Best)" },
    ],
    defaultModel: "claude-haiku-4-5-20251001",
    apiKeyPlaceholder: "sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    getKeyUrl: "https://console.anthropic.com/settings/keys",
    getKeySteps: [
      "Sign up at console.anthropic.com",
      "Add credits to your account",
      "Go to Settings → API Keys → Create Key",
    ],
    freeInfo: "High quality output, very affordable per token",
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    logo: "✨",
    region: "international",
    tagline: "Google-powered, generous free tier",
    models: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Recommended)", recommended: true },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
    ],
    defaultModel: "gemini-2.0-flash",
    apiKeyPlaceholder: "AIzaSy-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    getKeyUrl: "https://aistudio.google.com/apikey",
    getKeySteps: [
      "Sign in at aistudio.google.com with Google account",
      "Click 'Get API key' → Create API key in new project",
      "Copy the key and paste it here",
    ],
    freeInfo: "15 RPM free with Gemini 2.0 Flash — no credit card needed",
  },
};

export const CN_PROVIDERS = (Object.values(API_PROVIDERS) as ApiProvider[]).filter(
  (p) => p.region === "cn"
);

export const INTERNATIONAL_PROVIDERS = (Object.values(API_PROVIDERS) as ApiProvider[]).filter(
  (p) => p.region === "international"
);
