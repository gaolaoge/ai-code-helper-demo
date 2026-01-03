"use client";

import Code from "./code";
import Preview from "./preview";
import { useMemo } from "react";
import { useAppContext } from "@/app/providers";
import { Tabs } from "antd";
import { CodeOutlined, EyeOutlined } from "@ant-design/icons";

/**
 * 构建工具组件
 * 集成 DeepSeek Core、Code 和 Preview 组件，提供完整的 AI 代码生成和预览功能
 */
export default function Builder() {
  const { messages } = useAppContext();

  // 从消息中提取最后的助手回复作为代码
  const generatedCode = useMemo(() => {
    const lastAssistantMessage = messages
      .filter((msg) => msg.role === "assistant")
      .pop();
    return lastAssistantMessage?.content.code || "";
  }, [messages]);

  const tabItems = [
    {
      key: "code",
      label: (
        <span className="flex items-center gap-2">
          <CodeOutlined />
          代码
        </span>
      ),
      children: (
        <div className="h-full min-h-0">
          <Code language="javascript">{generatedCode}</Code>
        </div>
      ),
    },
    {
      key: "preview",
      label: (
        <span className="flex items-center gap-2">
          <EyeOutlined />
          预览
        </span>
      ),
      children: (
        <div className="h-full min-h-0">
          <Preview>{generatedCode}</Preview>
        </div>
      ),
      forceRender: true, // 强制在初始化时渲染，即使标签页未激活
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <Tabs
        defaultActiveKey="code"
        items={tabItems}
        className="h-full flex flex-col [&_.ant-tabs]:h-full [&_.ant-tabs-content-holder]:flex-1 [&_.ant-tabs-content-holder]:min-h-0 [&_.ant-tabs-tabpane]:h-full [&_.ant-tabs-content]:h-full"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      />
    </div>
  );
}
