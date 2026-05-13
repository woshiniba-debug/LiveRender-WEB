import { MockTemplate } from "./types";

export const EXAMPLE_PROMPTS = [
  "帮我生成一个咖啡店官网首页",
  "创建一个 SaaS 产品落地页",
  "生成一个健身房官网首页",
];

const TEMPLATES: MockTemplate[] = [
  {
    id: "coffee",
    name: "Coffee Shop",
    description: "A warm and inviting coffee shop website",
    keywords: ["咖啡", "coffee", "cafe", "咖啡店", "coffee shop"],
    primaryColor: "#6F4E37",
    accentColor: "#D4A96A",
    heroTitle: "每一杯，都是一次艺术",
    heroSubtitle:
      "精选来自埃塞俄比亚、哥伦比亚的单一产地豆，由我们的咖啡师手工制作，带给你最纯粹的咖啡体验。",
    ctaText: "探索我们的菜单",
    navItems: ["首页", "菜单", "关于我们", "门店", "联系我们"],
    features: [
      {
        icon: "☕",
        title: "精品单品咖啡",
        description: "我们只选用评级 90 分以上的精品豆，每批次亲自杯测。",
      },
      {
        icon: "🌿",
        title: "可持续来源",
        description: "与全球 12 个农场直接合作，确保公平贸易与环保种植。",
      },
      {
        icon: "👨‍🍳",
        title: "大师级烘焙",
        description: "我们的首席烘焙师拥有 15 年经验，每批次手工小批量烘焙。",
      },
    ],
  },
  {
    id: "saas",
    name: "SaaS Product",
    description: "A modern SaaS product landing page",
    keywords: ["saas", "产品", "product", "软件", "平台", "落地页", "landing"],
    primaryColor: "#6366F1",
    accentColor: "#8B5CF6",
    heroTitle: "让团队协作效率提升 10 倍",
    heroSubtitle:
      "一个平台，整合项目管理、团队沟通与数据分析。超过 50,000 个团队正在使用 FlowDesk 重新定义工作方式。",
    ctaText: "免费开始使用",
    navItems: ["产品", "功能", "定价", "案例", "文档"],
    features: [
      {
        icon: "⚡",
        title: "实时协作",
        description: "多人同步编辑，评论与变更实时同步，告别版本混乱。",
      },
      {
        icon: "📊",
        title: "智能数据看板",
        description: "一键生成项目报告，自定义 KPI 追踪，数据驱动决策。",
      },
      {
        icon: "🔒",
        title: "企业级安全",
        description: "SOC 2 Type II 认证，端到端加密，细粒度权限管理。",
      },
    ],
  },
  {
    id: "gym",
    name: "Gym & Fitness",
    description: "An energetic gym and fitness center website",
    keywords: ["健身", "gym", "fitness", "运动", "sport", "训练"],
    primaryColor: "#EF4444",
    accentColor: "#F97316",
    heroTitle: "突破极限，重塑自我",
    heroSubtitle:
      "专业教练团队、顶级设备、科学训练方案。加入我们，开启你的蜕变之旅。",
    ctaText: "立即免费体验",
    navItems: ["首页", "课程", "教练", "设施", "会员"],
    features: [
      {
        icon: "🏋️",
        title: "专业设备",
        description: "2000+ 平米训练空间，配备最新 Technogym 专业设备。",
      },
      {
        icon: "👟",
        title: "私人教练",
        description: "30 名持证专业教练，为你量身定制训练计划与饮食方案。",
      },
      {
        icon: "🎯",
        title: "多元课程",
        description: "每周 200+ 团体课程，从瑜伽到 CrossFit，总有适合你的。",
      },
    ],
  },
  {
    id: "default",
    name: "Generic Landing Page",
    description: "A clean and modern generic landing page",
    keywords: [],
    primaryColor: "#0EA5E9",
    accentColor: "#06B6D4",
    heroTitle: "构建更好的数字体验",
    heroSubtitle:
      "我们帮助企业打造令人印象深刻的数字产品，从概念到上线，全程陪伴。",
    ctaText: "开始你的项目",
    navItems: ["首页", "服务", "案例", "团队", "联系"],
    features: [
      {
        icon: "✨",
        title: "精美设计",
        description: "以用户为中心的设计理念，每个细节都经过精心打磨。",
      },
      {
        icon: "🚀",
        title: "高性能",
        description: "基于最新技术栈构建，确保最佳加载速度与用户体验。",
      },
      {
        icon: "📱",
        title: "全端适配",
        description: "响应式设计，在任何设备上都呈现完美效果。",
      },
    ],
  },
];

// ─── Template matching ────────────────────────────────────────────────────────
// Inverted index: keyword (lowercased) → template, built once at module load.
// O(1) exact-word matches; substring fallback iterates only the keyword set
// (small, bounded), still cheaper than the previous nested loop across full
// keyword arrays per template.

const DEFAULT_TEMPLATE: MockTemplate =
  TEMPLATES.find((t) => t.id === "default") ?? TEMPLATES[0];

const KEYWORD_INDEX: ReadonlyMap<string, MockTemplate> = (() => {
  const map = new Map<string, MockTemplate>();
  for (const template of TEMPLATES) {
    if (template.id === "default") continue;
    for (const kw of template.keywords ?? []) {
      const key = kw.toLowerCase();
      if (!map.has(key)) map.set(key, template);
    }
  }
  return map;
})();

const WORD_SPLIT_RE = /[\s,，。、.!?！？]+/u;

export function matchTemplate(prompt: string): MockTemplate {
  const lower = prompt.toLowerCase();

  // Fast path: whole-word exact match.
  for (const word of lower.split(WORD_SPLIT_RE)) {
    if (!word) continue;
    const hit = KEYWORD_INDEX.get(word);
    if (hit) return hit;
  }

  // Fallback: substring match across the keyword index (handles "咖啡店" etc.).
  for (const [kw, template] of KEYWORD_INDEX) {
    if (lower.includes(kw)) return template;
  }

  return DEFAULT_TEMPLATE;
}

// ─── Code generation ─────────────────────────────────────────────────────────
// generateMockCode is pure on `template` identity, so a WeakMap memo lets us
// skip the (sizeable) template-literal evaluation on repeat calls for the
// same object (e.g. when re-rendering after restoring a history entry).
const CODE_CACHE = new WeakMap<MockTemplate, string>();

export function generateMockCode(template: MockTemplate): string {
  const cached = CODE_CACHE.get(template);
  if (cached) return cached;
  const code = buildCode(template);
  CODE_CACHE.set(template, code);
  return code;
}

function buildCode(template: MockTemplate): string {
  return `import React from 'react';

// Generated by AI Web Designer
// Template: ${template.name}

const NAV_ITEMS = ${JSON.stringify(template.navItems)};

const FEATURES = ${JSON.stringify(template.features, null, 2)};

export default function GeneratedPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold" style={{ color: '${template.primaryColor}' }}>
            Brand
          </span>
          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a key={item} href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                {item}
              </a>
            ))}
          </div>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '${template.primaryColor}' }}
          >
            ${template.ctaText}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: 'radial-gradient(ellipse at 60% 50%, ${template.primaryColor}, transparent)' }}
        />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 border"
            style={{ color: '${template.primaryColor}', borderColor: '${template.accentColor}30', backgroundColor: '${template.accentColor}10' }}
          >
            ✦ AI 生成预览
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            ${template.heroTitle}
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            ${template.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-8 py-3.5 rounded-xl text-white font-semibold shadow-lg transition-all hover:scale-105"
              style={{ backgroundColor: '${template.primaryColor}' }}
            >
              ${template.ctaText}
            </button>
            <button className="px-8 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
              了解更多
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">为什么选择我们</h2>
            <p className="text-gray-500 max-w-xl mx-auto">我们提供全方位的专业服务，助力你的业务腾飞。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">准备好开始了吗？</h2>
          <p className="text-gray-500 mb-10 text-lg">加入数千个已经受益的用户，今天就迈出第一步。</p>
          <button
            className="px-10 py-4 rounded-xl text-white text-lg font-semibold shadow-xl transition-all hover:scale-105"
            style={{ backgroundColor: '${template.primaryColor}' }}
          >
            ${template.ctaText} →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-400">© 2025 Brand. All rights reserved.</span>
          <div className="flex gap-6">
            {['隐私政策', '使用条款', '联系我们'].map((item) => (
              <a key={item} href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}`;
}
