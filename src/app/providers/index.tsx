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

  // 组合上下文值
  const contextValue: AppContextType = {
    loading,
    chatInput,
    setLoading,
    setChatInput,
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
