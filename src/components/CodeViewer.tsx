"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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
      el.style.cssText = "position:fixed;opacity:0";
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
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-gray-900/80 px-4 py-2.5">
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

      {/* Syntax-highlighted code */}
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language="tsx"
          style={vscDarkPlus}
          showLineNumbers
          lineNumberStyle={{
            minWidth: "2.8em",
            paddingRight: "1em",
            color: "#3d4451",
            userSelect: "none",
            fontSize: "11px",
          }}
          customStyle={{
            margin: 0,
            padding: "16px 0",
            background: "transparent",
            fontSize: "12px",
            lineHeight: "1.6",
            height: "100%",
            overflow: "visible",
          }}
          codeTagProps={{
            style: { fontFamily: "var(--font-geist-mono), 'Fira Code', monospace" },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
