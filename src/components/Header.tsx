import { Sparkles, Settings2, Zap } from "lucide-react";
import { ApiConfig } from "@/lib/types";
import { API_PROVIDERS } from "@/lib/apiProviders";

interface HeaderProps {
  apiConfig: ApiConfig | null;
  onOpenSettings: () => void;
}

export default function Header({ apiConfig, onOpenSettings }: HeaderProps) {
  const provider = apiConfig ? API_PROVIDERS[apiConfig.provider] : null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900 tracking-tight">
            AI Web Designer
          </span>
          <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 ring-1 ring-indigo-100">
            BETA
          </span>
        </div>

        {/* Nav */}
        <nav className="hidden items-center gap-5 md:flex">
          {["功能", "示例", "定价", "文档"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {/* API Status button */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              provider
                ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
            }`}
          >
            {provider ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span>{provider.logo}</span>
                <span className="hidden sm:inline">{provider.name}</span>
                <span className="hidden sm:inline text-green-500">·</span>
                <span className="hidden sm:inline text-green-600">已连接</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" />
                <span>接入 AI</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="API 设置"
          >
            <Settings2 className="h-4 w-4" />
          </button>

          <div className="hidden h-5 w-px bg-gray-200 sm:block" />

          <button className="hidden sm:block text-sm text-gray-500 transition-colors hover:text-gray-900">
            登录
          </button>
          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700">
            免费使用
          </button>
        </div>
      </div>
    </header>
  );
}
