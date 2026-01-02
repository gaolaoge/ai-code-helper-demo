"use client";

import ChatInput from "./chatInput";
import DialogueRecord from "./dialogueRecord";

// 组件属性类型定义
interface AntdRichTextEditorProps {
  placeholder?: string;
  onSubmit?: (content: string) => void;
}

/**
 * Ant Design 富文本编辑器组件（替代方案）
 * 用于在没有TinyMCE许可证的情况下提供基本的富文本编辑功能
 * 使用全局上下文管理输入内容和加载状态
 */
export default function AntdRichTextEditor({
  placeholder = "请输入内容...",
  onSubmit,
}: AntdRichTextEditorProps) {
  return (
    <div className="h-full flex flex-col gap-4">
      {/* 历史对话记录展示区域 - 占据 90% 高度 */}
      <div className="flex-1 overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm">
        <DialogueRecord />
      </div>

      {/* 输入区域 - 占据剩余空间 */}
      <div className="h-[35%] min-h-[200px] flex flex-col">
        <ChatInput placeholder={placeholder} onSubmit={onSubmit} />
      </div>
    </div>
  );
}
