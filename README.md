# LiveRender-WEB

<div align="center">

**🌐 Language / 语言：** [English](#english) | [中文](#chinese)

</div>

---

<a id="english"></a>
## AI-Powered Landing Page Generator

LiveRender-WEB is a Next.js application that converts natural language descriptions into fully-rendered landing page previews and React + Tailwind CSS source code — instantly, in your browser.

### Features

- **Natural Language Input** — Describe your website in one sentence; get a complete Navbar / Hero / Features / CTA / Footer layout
- **Real AI Integration** — Supports 7 major LLM providers (CN + International); bring your own API key
- **Streaming Responses** — Partial results appear progressively as the AI writes — no waiting for the full response
- **Preview / Code Tabs** — Live visual preview alongside the generated React + Tailwind source
- **One-Click Export** — Download the result as a standalone HTML file or copy the React component
- **Mock Mode** — Works without any API key; built-in templates for coffee shop, SaaS, gym, and more

### Supported AI Providers

| Region | Provider | Recommended Model |
|--------|----------|-------------------|
| 🌏 CN | DeepSeek | DeepSeek V3 |
| 🌏 CN | Kimi (Moonshot) | moonshot-v1-8k |
| 🌏 CN | Qwen (Tongyi) | qwen-plus |
| 🌏 CN | ZhiPu AI (GLM) | GLM-4-Flash (Free) |
| 🌍 Global | OpenAI | GPT-4o Mini |
| 🌍 Global | Anthropic Claude | Claude Haiku 4.5 |
| 🌍 Global | Google Gemini | Gemini 2.0 Flash (Free tier) |

### Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Architecture**: Provider strategy pattern, SSE streaming, custom hooks (`useGenerate`, `useHistory`, `useApiConfig`)
- **Data**: Inverted-index template matching, WeakMap code cache

### Deployment

#### Option 1 — Vercel (Recommended, zero config)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/woshiniba-debug/LiveRender-WEB)

1. Click the button above
2. Connect your GitHub account and fork the repo
3. Vercel auto-detects Next.js and deploys — no environment variables required (API keys are entered by end-users at runtime)

#### Option 2 — Local Development

```bash
git clone https://github.com/woshiniba-debug/LiveRender-WEB.git
cd LiveRender-WEB
npm install
npm run dev
# Open http://localhost:3000
```

#### Option 3 — Docker

```bash
docker build -t liverender-web .
docker run -p 3000:3000 liverender-web
# Open http://localhost:3000
```

Or with Docker Compose:

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
```

```bash
docker compose up -d
```

#### Option 4 — Production Build (Self-host)

```bash
npm install
npm run build
npm start
# Runs on http://localhost:3000
```

Use a reverse proxy (Nginx / Caddy) to expose it over HTTPS.

### Usage

1. Open the app in your browser
2. *(Optional)* Click the API settings icon → choose a provider → paste your API key
3. Type a description, e.g. *"Create a minimalist coffee shop homepage with warm brown tones"*
4. Click **Generate** — the landing page streams in live
5. Switch to the **Code** tab to copy the React source, or click **Export HTML** for a standalone file

---

<a id="chinese"></a>
## AI 驱动的落地页生成器

LiveRender-WEB 是一个 Next.js 应用，将自然语言描述转换为完整的落地页预览和 React + Tailwind CSS 源代码——在浏览器中即时完成。

### 功能特性

- **自然语言输入** — 一句话描述你的网站，即生成完整 Navbar / Hero / Features / CTA / Footer 布局
- **真实 AI 接入** — 支持 7 个主流大模型（国内 + 海外），用户自备 API Key
- **流式响应** — AI 生成过程中实时展示，无需等待完整结果
- **Preview / Code 双 Tab** — 实时预览效果 + 查看 React + Tailwind 源码
- **一键导出** — 下载独立 HTML 文件或复制 React 组件
- **Mock 模式** — 无需 API Key，内置咖啡店、SaaS、健身房等场景模板

### 部署方法

#### 方式一 — Vercel（推荐，零配置）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/woshiniba-debug/LiveRender-WEB)

点击上方按钮，授权 GitHub，Vercel 自动识别 Next.js 并完成部署。无需配置环境变量（API Key 由用户在页面运行时输入）。

#### 方式二 — 本地开发

```bash
git clone https://github.com/woshiniba-debug/LiveRender-WEB.git
cd LiveRender-WEB
npm install
npm run dev
# 访问 http://localhost:3000
```

#### 方式三 — Docker

```bash
docker build -t liverender-web .
docker run -p 3000:3000 liverender-web
```

#### 方式四 — 生产环境自托管

```bash
npm install
npm run build
npm start
```

使用 Nginx / Caddy 作反向代理并配置 HTTPS。

### 使用方法

1. 打开应用
2. （可选）点击 API 设置图标，选择服务商并填入 API Key
3. 在输入框描述你的网页，例如：*"帮我生成一个极简风格的咖啡店官网"*
4. 点击 **Generate**，落地页实时流式渲染
5. 切换到 **Code** 标签复制 React 源码，或点击 **导出 HTML** 获取独立文件
