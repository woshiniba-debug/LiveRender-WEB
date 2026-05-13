"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type {
  ApiConfig,
  GenerateResult,
  GenerateState,
  MockTemplate,
  StreamEvent,
} from "@/lib/types";
import { API_PROVIDERS } from "@/lib/apiProviders";
import { generateMockCode, matchTemplate } from "@/lib/mockData";

type GenerateAction =
  | { type: "start"; prompt: string }
  | { type: "delta"; text: string }
  | { type: "partial"; template: Partial<MockTemplate> }
  | { type: "success"; result: GenerateResult }
  | { type: "error"; message: string }
  | { type: "abort" }
  | { type: "reset" }
  | { type: "restore"; result: GenerateResult; prompt: string };

function reducer(state: GenerateState, action: GenerateAction): GenerateState {
  switch (action.type) {
    case "start":
      return { status: "generating", prompt: action.prompt };
    case "delta":
      if (state.status !== "generating") return state;
      return {
        ...state,
        streamText: (state.streamText ?? "") + action.text,
      };
    case "partial":
      if (state.status !== "generating") return state;
      return { ...state, partial: action.template };
    case "success":
      return {
        status: "success",
        result: action.result,
        prompt:
          state.status === "generating" || state.status === "error"
            ? state.prompt
            : action.result.template.name,
      };
    case "error":
      return {
        status: "error",
        message: action.message,
        prompt: state.status !== "idle" ? state.prompt : "",
      };
    case "abort":
      return { status: "idle" };
    case "reset":
      return { status: "idle" };
    case "restore":
      return { status: "success", result: action.result, prompt: action.prompt };
  }
}

interface UseGenerateOptions {
  onSuccess?: (prompt: string, result: GenerateResult) => void;
}

export function useGenerate(
  apiConfig: ApiConfig | null,
  options: UseGenerateOptions = {}
) {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  // Avoid stale closure on `onSuccess`.
  const onSuccessRef = useRef(options.onSuccess);
  useEffect(() => {
    onSuccessRef.current = options.onSuccess;
  }, [options.onSuccess]);

  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    dispatch({ type: "abort" });
  }, []);

  const runMock = useCallback(
    async (prompt: string) => {
      // Mild artificial latency so the loading UI feels real.
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
      const template = matchTemplate(prompt);
      const code = generateMockCode(template);
      const result: GenerateResult = {
        template,
        code,
        timestamp: Date.now(),
        isAiGenerated: false,
      };
      dispatch({ type: "success", result });
      onSuccessRef.current?.(prompt, result);
    },
    []
  );

  const runStream = useCallback(
    async (prompt: string, cfg: ApiConfig) => {
      // Always cancel any in-flight request before starting a new one.
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            provider: cfg.provider,
            apiKey: cfg.apiKey,
            model: cfg.model,
          }),
          signal: ac.signal,
        });

        // Non-streaming error responses come back as JSON (4xx).
        const contentType = res.headers.get("Content-Type") ?? "";
        if (!res.ok && !contentType.includes("text/event-stream")) {
          const err = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(err.error ?? `请求失败 (${res.status})`);
        }
        if (!res.body) throw new Error("无响应主体");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalTemplate: MockTemplate | null = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const raw = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            for (const line of raw.split("\n")) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload) continue;
              let event: StreamEvent;
              try {
                event = JSON.parse(payload) as StreamEvent;
              } catch {
                continue;
              }
              if (event.type === "delta") {
                dispatch({ type: "delta", text: event.text });
              } else if (event.type === "partial") {
                dispatch({ type: "partial", template: event.template });
              } else if (event.type === "done") {
                finalTemplate = event.template;
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            }
          }
        }

        if (!finalTemplate) throw new Error("生成失败，未收到完整结果");

        const code = generateMockCode(finalTemplate);
        const result: GenerateResult = {
          template: finalTemplate,
          code,
          timestamp: Date.now(),
          isAiGenerated: true,
          providerName: API_PROVIDERS[cfg.provider]?.name,
        };
        dispatch({ type: "success", result });
        onSuccessRef.current?.(prompt, result);
      } catch (err) {
        if (ac.signal.aborted) {
          // User-initiated cancel: do nothing extra (already dispatched).
          return;
        }
        dispatch({
          type: "error",
          message:
            err instanceof Error
              ? err.message
              : "生成失败，请检查 API Key 是否正确",
        });
      } finally {
        if (abortRef.current === ac) abortRef.current = null;
      }
    },
    []
  );

  const generate = useCallback(
    (prompt: string) => {
      dispatch({ type: "start", prompt });
      if (apiConfig?.apiKey) {
        void runStream(prompt, apiConfig);
      } else {
        void runMock(prompt);
      }
    },
    [apiConfig, runStream, runMock]
  );

  const regenerate = useCallback(() => {
    const prompt =
      state.status === "generating" ||
      state.status === "success" ||
      state.status === "error"
        ? state.prompt
        : null;
    if (prompt) generate(prompt);
  }, [state, generate]);

  // Drop in-flight requests on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  const restore = useCallback((result: GenerateResult, prompt: string) => {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: "restore", result, prompt });
  }, []);

  return { state, generate, regenerate, abort, restore };
}
