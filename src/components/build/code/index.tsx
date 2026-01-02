"use client";

import { CodeOutlined } from "@ant-design/icons";

interface CodeProps {
  language?: string;
  children: string;
}

function Code({ language = "javascript", children }: CodeProps) {
  if (!children.trim()) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <CodeOutlined className="text-5xl mb-4 opacity-30" />
        <div className="text-lg font-medium">暂无代码</div>
        <div className="text-sm mt-2">代码将在这里显示</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-zinc-400 ml-2 font-mono">
            {language}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm text-zinc-100 font-mono leading-relaxed whitespace-pre-wrap break-words">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
}

export default Code;
