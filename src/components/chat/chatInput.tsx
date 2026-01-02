"use client";

import { FormEvent, useState, KeyboardEvent } from "react";
import { Button, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useAppContext } from "@/app/providers";
import { ChatMessageType } from "@/types";

interface ChatInputProps {
  placeholder?: string;
  onSubmit?: (content: string) => void;
}

function ChatInput({ placeholder = "请输入内容..." }: ChatInputProps) {
  const {
    messages,
    setChatInput,
    addMessage,
    shouldClearServerHistory,
    markServerHistoryCleared,
  } = useAppContext();
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * 处理编辑器内容变化
   */
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  /**
   * 内部提交处理函数
   */
  const performSubmit = async () => {
    if (!inputValue.trim()) {
      message.warning("请输入内容");
      return;
    }

    try {
      setLoading(true);
      const clientMessage = {
        role: "user",
        content: inputValue,
      } as ChatMessageType;

      // 先添加用户消息到前端展示的历史记录（Provider 维护）
      addMessage(clientMessage);

      // 判断是否为第一次消息或需要清空历史
      const isFirstMessage = messages.length === 0 || shouldClearServerHistory;

      // 调用 API，只发送新消息（不发送完整历史）
      // DeepSeekCore 会在服务端维护和优化自己的消息队列
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: {
            role: "user",
            content: inputValue,
          },
          includeSystem: isFirstMessage, // 只在第一次请求或清空历史后包含 systemPrompt
          clearHistory: shouldClearServerHistory, // 如果需要清空服务端历史
        }),
      });

      // 标记服务端历史已清空
      if (shouldClearServerHistory) {
        markServerHistoryCleared();
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "API 调用失败");
      }

      const data = await response.json();

      // 添加助手回复到前端展示的历史记录
      const assistantMessage = {
        role: "assistant",
        content: data.content,
      } as ChatMessageType;
      addMessage(assistantMessage);
      setChatInput(inputValue);

      // 提交成功后清空输入框
      setInputValue("");
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "提交失败，请重试"
      );
      console.error("提交错误:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理键盘事件，支持 Ctrl+Enter 或 Cmd+Enter 提交
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (inputValue.trim() && !loading) {
        performSubmit();
      }
    }
  };

  /**
   * 处理表单提交
   */
  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    performSubmit();
  };

  return (
    <div className="h-full flex flex-col rounded-xl border border-zinc-200/80 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm overflow-hidden">
      <form className="h-full flex flex-col" onSubmit={handleChatSubmit}>
        <div className="flex-1 flex flex-col p-4">
          <textarea
            id="richTextInput"
            value={inputValue}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 w-full p-3 border-0 bg-transparent resize-none focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            aria-label="消息输入框"
            disabled={loading}
          />
        </div>

        <footer className="flex justify-between items-center px-4 py-3 border-t border-zinc-200/80 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="text-xs text-zinc-400 dark:text-zinc-500">
            按{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded">
              Enter
            </kbd>{" "}
            发送
          </div>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleChatSubmit}
            disabled={!inputValue.trim() || loading}
            htmlType="submit"
            className="flex items-center gap-1.5 shadow-sm hover:shadow-md transition-shadow"
            loading={loading}
            size="middle"
          >
            发送
          </Button>
        </footer>
      </form>
    </div>
  );
}

export default ChatInput;
