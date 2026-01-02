"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// 应用全局状态类型定义
export interface AppState {
  loading: boolean;
  chatInput: string;
}

// Context类型定义
export interface AppContextType extends AppState {
  // 加载状态相关方法
  setLoading: (loading: boolean) => void;

  // 聊天输入相关方法
  setChatInput: (chatInput: string) => void;

  // 消息相关方法
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  addMessage: (message: {
    role: "user" | "assistant";
    content: string;
  }) => void;
  clearMessages: () => void;
  shouldClearServerHistory: boolean;
  markServerHistoryCleared: () => void;
}

// 默认状态
const defaultState: AppState = {
  loading: false,
  chatInput: "",
};

// 创建Context
export const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件属性类型定义
interface AppProviderProps {
  children: ReactNode;
}

/**
 * 应用全局状态管理Provider
 * 提供加载状态和聊天输入管理功能
 */
export const AppProvider = ({ children }: AppProviderProps) => {
  // 初始化状态
  const [loading, setLoading] = useState<boolean>(defaultState.loading);
  const [chatInput, setChatInput] = useState<string>(defaultState.chatInput);
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]); // 完整会话记录（用于 UI 展示）
  const [shouldClearServerHistory, setShouldClearServerHistory] =
    useState<boolean>(false);

  const addMessage = (message: {
    role: "user" | "assistant";
    content: string;
  }) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const clearMessages = () => {
    setMessages([]);
    // 标记需要清空服务端历史（在下次请求时清空）
    setShouldClearServerHistory(true);
  };

  // 全局初始化逻辑

  const markServerHistoryCleared = () => {
    setShouldClearServerHistory(false);
  };

  // 组合上下文值
  const contextValue: AppContextType = {
    loading,
    chatInput,
    setLoading,
    setChatInput,
    messages,
    addMessage,
    clearMessages,
    shouldClearServerHistory,
    markServerHistoryCleared,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

/**
 * 自定义Hook，用于访问应用全局状态
 * 使用前确保已在组件树中添加AppProvider
 */
export const useAppContext = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
};

// 默认导出Provider
export default AppProvider;
