"use client";

import { PenLine, Eye } from "lucide-react";

export type MobileTab = "input" | "preview";

interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  hasResult: boolean;
  isGenerating: boolean;
}

export default function MobileTabBar({
  activeTab,
  onTabChange,
  hasResult,
  isGenerating,
}: MobileTabBarProps) {
  const tabs = [
    {
      id: "input" as MobileTab,
      label: "生成",
      icon: <PenLine className="h-[22px] w-[22px]" />,
      badge: false,
    },
    {
      id: "preview" as MobileTab,
      label: "预览",
      icon: <Eye className="h-[22px] w-[22px]" />,
      badge: hasResult || isGenerating,
    },
  ];

  return (
    <div className="md:hidden shrink-0 border-t border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors ${
                isActive ? "text-indigo-600" : "text-gray-400 active:text-gray-600"
              }`}
            >
              {/* Top indicator line */}
              <div
                className={`absolute inset-x-6 top-0 h-[2px] rounded-b-full transition-all duration-200 ${
                  isActive ? "bg-indigo-500 opacity-100" : "opacity-0"
                }`}
              />

              {/* Icon + badge */}
              <div className="relative">
                {tab.icon}
                {tab.badge && (
                  <span
                    className={`absolute -right-1.5 -top-1.5 flex h-2.5 w-2.5 items-center justify-center ${
                      isGenerating ? "animate-pulse" : ""
                    }`}
                  >
                    <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping" />
                    <span className="relative h-2 w-2 rounded-full bg-indigo-500" />
                  </span>
                )}
              </div>

              <span className="text-[11px] font-semibold tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* iOS home indicator safe area */}
      <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
    </div>
  );
}
