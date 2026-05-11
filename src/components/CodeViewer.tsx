"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

interface CodeViewerProps {
  code: string;
}

export default function CodeViewer({ code }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split("\n").length;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl bg-gray-950 ring-1 ring-white/5">
      {/* Code header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-gray-900/80 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Terminal className="h-3.5 w-3.5 text-gray-600" />
          <span className="font-mono">GeneratedPage.tsx</span>
          <span className="text-gray-700">·</span>
          <span>{lineCount} lines</span>
        </div>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            copied
              ? "border border-green-700 bg-green-900/40 text-green-400"
              : "border border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              已复制
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              复制代码
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="flex flex-1 overflow-auto">
        {/* Line numbers */}
        <div className="select-none border-r border-white/5 bg-gray-900/30 px-3 py-4 text-right">
          {code.split("\n").map((_, i) => (
            <div key={i} className="font-mono text-xs leading-5 text-gray-700">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code */}
        <pre className="flex-1 overflow-x-auto p-4 font-mono text-xs leading-5 text-gray-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
