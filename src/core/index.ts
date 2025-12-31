"use client";

import { useAppContext } from "../app/providers";
import { message } from "antd";

// DeepSeek API 响应类型定义
interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: "system" | "user" | "assistant";
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 组件属性类型定义
interface DeepSeekCoreProps {
  onCodeGenerated?: (code: string) => void;
  onPreviewGenerated?: (preview: string) => void;
  className?: string;
}

/**
 * DeepSeek API 核心组件
 * 负责与 DeepSeek API 交互，调用其AI能力生成代码或其他内容
 */
class DeepSeekCore {
  apiKey: string;
  response: string;
  error: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;

  constructor({ onCodeGenerated, onPreviewGenerated }: DeepSeekCoreProps) {
    this.apiKey = "";
    this.response = "";
    this.error = "";
    this.messages = [];
  }

  getInstance() {}

  // DeepSeek API 调用函数
  // callDeepSeekApi = async (chatInput: string) => {
  //   if (!this.apiKey.trim()) {
  //     message.warning("请输入 DeepSeek API Key");
  //     return;
  //   }

  //   if (!chatInput.trim()) {
  //     message.warning("请输入提示内容");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setError("");

  //     // 更新消息历史
  //     const newMessages = [...messages, { role: "user", content: chatInput }];
  //     setMessages(newMessages);

  //     // 调用 DeepSeek API
  //     const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${apiKey}`,
  //       },
  //       body: JSON.stringify({
  //         model: "deepseek-chat",
  //         messages: newMessages,
  //         temperature: 0.7,
  //         max_tokens: 2048,
  //       }),
  //     });

  //     if (!res.ok) {
  //       throw new Error(`API 请求失败: ${res.statusText}`);
  //     }

  //     const data: DeepSeekResponse = await res.json();
  //     const assistantResponse = data.choices[0].message.content;

  //     // 更新响应和消息历史
  //     setResponse(assistantResponse);
  //     setMessages([
  //       ...newMessages,
  //       { role: "assistant", content: assistantResponse },
  //     ]);

  //     // 调用回调函数，将响应传递给父组件
  //     if (onCodeGenerated) {
  //       onCodeGenerated(assistantResponse);
  //     }

  //     if (onPreviewGenerated) {
  //       onPreviewGenerated(assistantResponse);
  //     }

  //     message.success("API 调用成功");
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : "未知错误";
  //     setError(`API 调用失败: ${errorMessage}`);
  //     message.error(`API 调用失败: ${errorMessage}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // 清空响应
  // clearResponse = () => {
  //   setResponse("");
  //   setError("");
  //   setMessages([]);
  // };
}

export default DeepSeekCore;
