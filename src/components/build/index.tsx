"use client";

import Code from "./code";
import Preview from "./preview";
import { useState } from "react";

// 右侧内容组件属性类型定义
interface RightContentProps {
  className?: string;
}

/**
 * 构建工具组件
 * 集成 DeepSeek Core、Code 和 Preview 组件，提供完整的 AI 代码生成和预览功能
 */
export default function Builder({ className = "" }: RightContentProps) {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [generatedPreview, setGeneratedPreview] = useState<string>("");

  return <div>PREVIEW</div>;
}
