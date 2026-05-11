# AI Web Designer

一个 AI 驱动的前端网页设计生成器 Mock MVP。用户输入自然语言需求，系统即时生成完整落地页预览与 React + Tailwind 代码。

## 功能特性

- **自然语言生成** — 输入一句话，生成包含 Navbar / Hero / Features / CTA / Footer 的完整落地页
- **真实 AI 接入** — 支持 7 个主流大模型（国内 + 海外），用户自备 API Key
- **Preview / Code 双 Tab** — 实时预览生成效果 + 查看 React + Tailwind 源码
- **一键复制代码** — 直接复制生成的组件代码到项目中使用
- **Mock 模式** — 无需 API Key 也可体验，内置咖啡店、SaaS、健身房等场景模板

## 支持的 AI 服务商

| 地区 | 服务商 | 推荐模型 |
|------|--------|----------|
| 🌏 国内 | DeepSeek | DeepSeek V3 |
| 🌏 国内 | Kimi (月之暗面) | moonshot-v1-8k |
| 🌏 国内 | 通义千问 (Qwen) | qwen-plus |
| 🌏 国内 | 智谱 AI (GLM) | GLM-4-Flash（免费）|
| 🌍 海外 | OpenAI | GPT-4o Mini |
| 🌍 海外 | Anthropic Claude | Claude Haiku 4.5 |
| 🌍 海外 | Google Gemini | Gemini 2.0 Flash（免费额度）|

## 快速开始

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 技术栈

- **Next.js 16** App Router
- **TypeScript**
- **Tailwind CSS v4**
- **React 19**
- **lucide-react** 图标库

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 主页面（状态管理）
│   ├── layout.tsx            # 根布局
│   └── api/generate/route.ts # AI 生成服务端代理
├── components/
│   ├── Header.tsx            # 顶栏（含 API 连接状态）
│   ├── PromptInput.tsx       # 左侧输入区
│   ├── PreviewPanel.tsx      # 右侧预览区（Preview / Code Tab）
│   ├── MockWebsite.tsx       # 生成的模拟网页
│   ├── CodeViewer.tsx        # 代码展示 + 复制
│   └── ApiSettings.tsx       # API Key 配置弹窗
└── lib/
    ├── types.ts              # TypeScript 类型定义
    ├── apiProviders.ts       # 各服务商配置与 API Key 获取指引
    └── mockData.ts           # Mock 模板数据 + 代码生成
```

## API Key 安全说明

API Key 仅保存在用户浏览器的 `localStorage` 中，不会上传到任何服务器。生成请求通过 Next.js 服务端路由代理转发，Key 不会暴露在客户端网络请求中。
