"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ChatMessageType } from "@/types";

// 应用全局状态类型定义
export interface AppState {
  loading: boolean;
}

// Context类型定义
export interface AppContextType extends AppState {
  // 加载状态相关方法
  setLoading: (loading: boolean) => void;

  // 消息相关方法
  messages: Array<ChatMessageType>;
  addMessage: (message: ChatMessageType) => void;
  clearMessages: () => void;
  shouldClearServerHistory: boolean;
  markServerHistoryCleared: () => void;
}

// 默认状态
const defaultState: AppState = {
  loading: false,
};

// 创建Context
export const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件属性类型定义
interface AppProviderProps {
  children: ReactNode;
}

/**
 * 应用全局状态管理Provider
 * 提供加载状态和消息管理功能
 */
export const AppProvider = ({ children }: AppProviderProps) => {
  // 初始化状态
  const [loading, setLoading] = useState<boolean>(defaultState.loading);
  const [messages, setMessages] = useState<Array<ChatMessageType>>([]); // 完整会话记录（用于 UI 展示）
  const [shouldClearServerHistory, setShouldClearServerHistory] =
    useState<boolean>(false);

  const addMessage = (message: ChatMessageType) => {
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
    setLoading,
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
