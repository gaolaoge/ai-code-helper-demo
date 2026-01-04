"use client";

import { EyeOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import generateHtmlContent from "./template";
import mockCode from "@/mock/mockCode.txt";
import { MOCK_CODE_KEY } from "@/constants/app";

// 预览组件属性类型定义
interface PreviewProps {
  children: string;
}

/**
 * 预览展示组件
 * 使用 iframe 沙箱环境渲染 JSX 代码
 */
function Preview({ children }: PreviewProps) {
  const [useMockCode, setUseMockCode] = useState(false);

  useEffect(() => {
    const mockEnabled = localStorage.getItem(MOCK_CODE_KEY) === "true";
    setUseMockCode(mockEnabled);
  }, []);

  children = useMockCode ? mockCode : children;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!children.trim() || !iframeRef.current) {
      // 使用 setTimeout 避免同步 setState
      setTimeout(() => setIsLoading(false), 0);
      return;
    }

    const iframe = iframeRef.current;

    if (!iframe) {
      // 使用 setTimeout 避免同步 setState
      setTimeout(() => {
        setError("无法访问 iframe");
        setIsLoading(false);
      }, 0);
      return;
    }

    // 使用 setTimeout 避免同步 setState
    setTimeout(() => {
      setIsLoading(true);
      setError(null);
    }, 0);

    // 提取 JSX 代码（尝试从代码块中提取）
    let jsxCode = children.trim();

    // 尝试从 markdown 代码块中提取
    const codeBlockMatch = jsxCode.match(
      /```(?:jsx|tsx|javascript|typescript)?\s*([\s\S]*?)```/
    );
    if (codeBlockMatch) {
      jsxCode = codeBlockMatch[1].trim();
    }

    // 转义代码中的特殊字符（用于 JavaScript 模板字符串）
    // 注意：不要使用 HTML 转义（&quot;、&#39;），因为代码是在 JS 模板字符串中使用的
    const escapedCode = jsxCode
      .replace(/\\/g, "\\\\") // 转义反斜杠
      .replace(/`/g, "\\`") // 转义反引号
      .replace(/\${/g, "\\${") // 转义模板字符串插值
      .replace(/\r\n/g, "\n") // 统一换行符
      .replace(/\r/g, "\n"); // 统一换行符
    // 注意：引号（单引号和双引号）不需要转义，因为我们在模板字符串中使用

    // 获取当前页面的 origin，用于构建 API 路径
    const apiOrigin =
      typeof window !== "undefined" ? window.location.origin : "";

    // 创建 iframe 内容 HTML
    // 使用 jsDelivr CDN，它有更好的 CORS 支持
    const htmlContent = generateHtmlContent(apiOrigin, escapedCode);
    // 使用 blob URL 来避免 CORS 问题
    // blob URL 在同源上下文中被视为同源，可以避免 CORS 限制
    // 注意：即使使用 blob URL，从外部 CDN 加载的脚本仍需要 CORS 支持
    // 我们已经改用 jsDelivr CDN，它支持 CORS
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    iframe.src = blobUrl;

    // 监听加载完成
    const handleLoad = () => {
      setIsLoading(false);
      // 延迟清理 blob URL，确保 iframe 已完全加载
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    };

    const handleError = () => {
      setIsLoading(false);
      setError("iframe 加载失败");
      URL.revokeObjectURL(blobUrl);
    };

    iframe.addEventListener("load", handleLoad);
    iframe.addEventListener("error", handleError);

    // 设置超时（增加到 30 秒，因为依赖加载和代码执行可能需要时间）
    const timeout = setTimeout(() => {
      setIsLoading(false);
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const root = iframeDoc.getElementById("root");
        const hasContent =
          root && (root.hasChildNodes() || root.innerHTML.trim() !== "");

        if (!hasContent) {
          // 检查是否有错误信息
          const errorContainer = iframeDoc.querySelector(".error-container");
          if (errorContainer) {
            setError(
              "渲染失败: " + errorContainer.textContent?.substring(0, 200)
            );
          } else {
            // 检查依赖是否加载
            const iframeWindow = iframeDoc.defaultView as Window & {
              React?: unknown;
              ReactDOM?: unknown;
              Babel?: unknown;
            };
            const reactReady = iframeWindow?.React !== undefined;
            const reactDOMReady = iframeWindow?.ReactDOM !== undefined;
            const babelReady = iframeWindow?.Babel !== undefined;

            if (!reactReady || !reactDOMReady || !babelReady) {
              setError("依赖加载超时，请检查网络连接");
            } else {
              setError("渲染超时，请检查代码是否正确");
            }
          }
        }
      } else {
        setError("无法访问 iframe 内容");
      }
      URL.revokeObjectURL(blobUrl);
    }, 30000); // 增加到 30 秒

    return () => {
      iframe.removeEventListener("load", handleLoad);
      iframe.removeEventListener("error", handleError);
      clearTimeout(timeout);

      // 清理 blob URL
      try {
        URL.revokeObjectURL(blobUrl);
      } catch {
        // 忽略清理错误
      }

      // 清理 iframe 内容，防止异步操作继续执行
      try {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          // 标记为已清理，防止异步操作继续
          const iframeWindow = iframeDoc.defaultView as Window & {
            antdLoaded?: boolean;
            iconsLoaded?: boolean;
            dependenciesLoaded?: boolean;
          };
          if (iframeWindow) {
            iframeWindow.antdLoaded = false;
            iframeWindow.iconsLoaded = false;
            iframeWindow.dependenciesLoaded = false;
          }
        }
      } catch {
        // 忽略跨域错误
      }
    };
  }, [children]);

  if (!children.trim()) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <EyeOutlined className="text-5xl mb-4 opacity-30" />
        <div className="text-lg font-medium">暂无预览</div>
        <div className="text-sm mt-2">预览内容将在这里显示</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <EyeOutlined className="text-zinc-500 dark:text-zinc-400" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            实时预览
          </span>
        </div>
        {isLoading && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            加载中...
          </span>
        )}
      </div>
      <div className="flex-1 overflow-hidden relative">
        {error && (
          <div className="absolute top-2 left-2 right-2 z-10 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
          // 安全说明：
          // allow-scripts + allow-same-origin 的组合确实会降低沙箱安全性
          // 但这是必需的，因为我们需要：
          // 1. allow-scripts: 执行用户代码
          // 2. allow-same-origin: 通过 API 路由加载资源
          // 我们通过以下方式增强安全性：
          // - 使用 blob URL 隔离内容
          // - 通过 API 代理所有外部资源（避免直接访问外部 CDN）
          // - 使用 CSP (Content Security Policy) 限制资源加载
          // - 限制代码执行环境（仅提供必要的 API）
          title="React Preview Sandbox"
        />
      </div>
    </div>
  );
}

export default Preview;
