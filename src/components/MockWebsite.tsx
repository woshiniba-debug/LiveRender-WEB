"use client";

import { MockTemplate } from "@/lib/types";

interface MockWebsiteProps {
  template: MockTemplate;
  /** When true, render hero text with a streaming-cursor effect. */
  streaming?: boolean;
}

export default function MockWebsite({ template, streaming = false }: MockWebsiteProps) {
  const { primaryColor, accentColor } = template;

  return (
    <div className="min-h-full bg-white font-sans antialiased">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span className="text-base font-bold tracking-tight" style={{ color: primaryColor }}>
            Brand
          </span>
          <div className="hidden items-center gap-7 md:flex">
            {template.navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                {item}
              </a>
            ))}
          </div>
          <button
            className="rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            {template.ctaText}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Gradient blobs */}
        <div
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full blur-3xl"
          style={{ background: `${accentColor}18` }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-10 h-64 w-64 rounded-full blur-3xl"
          style={{ background: `${primaryColor}10` }}
        />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          {/* Badge */}
          <div
            className="mb-6 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold"
            style={{
              color: primaryColor,
              borderColor: `${accentColor}50`,
              backgroundColor: `${accentColor}12`,
            }}
          >
            <span>✦</span>
            <span>AI 生成预览</span>
          </div>

          <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-5xl">
            {template.heroTitle}
            {streaming && (
              <span
                aria-hidden
                className="ml-1 inline-block h-[1em] w-[2px] translate-y-1 animate-pulse bg-indigo-500 align-middle"
              />
            )}
          </h1>

          <p className="mx-auto mb-9 max-w-xl text-base leading-relaxed text-gray-500">
            {template.heroSubtitle}
            {streaming && template.heroSubtitle && (
              <span
                aria-hidden
                className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-0.5 animate-pulse bg-gray-400 align-middle"
              />
            )}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              className="w-full rounded-xl px-7 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:w-auto"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 8px 25px -5px ${primaryColor}50`,
              }}
            >
              {template.ctaText}
            </button>
            <button className="w-full rounded-xl border border-gray-200 px-7 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:w-auto">
              了解更多 →
            </button>
          </div>

          {/* Trust signals */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">⭐ 4.9 用户评分</span>
            <span>·</span>
            <span>50,000+ 活跃用户</span>
            <span>·</span>
            <span>无需信用卡</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50/70 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold text-gray-900">为什么选择我们</h2>
            <p className="mx-auto max-w-lg text-sm text-gray-500">
              专注于打磨每一个细节，只为给你最好的体验。
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {template.features.map((feature, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: `${primaryColor}12` }}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-sm font-bold text-gray-900">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: "50K+", label: "活跃用户" },
              { value: "99.9%", label: "服务可用率" },
              { value: "4.9★", label: "用户评分" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-3xl font-extrabold tracking-tight"
                  style={{ color: primaryColor }}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <div
            className="relative overflow-hidden rounded-3xl px-10 py-14 text-center text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
            }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white, transparent)" }}
            />
            <h2 className="mb-3 text-3xl font-extrabold leading-tight">准备好开始了吗？</h2>
            <p className="mb-8 text-sm opacity-80">
              加入数千个已经受益的用户，今天就迈出第一步。
            </p>
            <button className="rounded-xl bg-white px-9 py-3.5 text-sm font-bold transition-all hover:scale-105 hover:shadow-lg"
              style={{ color: primaryColor }}
            >
              {template.ctaText} →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <span className="text-xs font-semibold" style={{ color: primaryColor }}>
            Brand
          </span>
          <span className="text-xs text-gray-400">© 2025 Brand. All rights reserved.</span>
          <div className="flex gap-5">
            {["隐私政策", "使用条款", "联系我们"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-gray-400 transition-colors hover:text-gray-600"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
