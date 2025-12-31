"use client";

import { FormEvent } from "react";
import { Button, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useAppContext } from "../../app/providers";

// 组件属性类型定义
interface AntdRichTextEditorProps {
  placeholder?: string;
  height?: string;
  onSubmit?: (content: string) => void;
}

/**
 * Ant Design 富文本编辑器组件（替代方案）
 * 用于在没有TinyMCE许可证的情况下提供基本的富文本编辑功能
 * 使用全局上下文管理输入内容和加载状态
 */
export default function AntdRichTextEditor({
  placeholder = "请输入内容...",
  height = "calc(100vh - 250px)",
  onSubmit,
}: AntdRichTextEditorProps) {
  // 使用全局上下文
  const { chatInput, setChatInput, loading, setLoading } = useAppContext();

  /**
   * 处理编辑器内容变化
   */
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
  };

  /**
   * 处理表单提交
   */
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!chatInput.trim()) {
      message.warning("请输入内容");
      return;
    }

    try {
      setLoading(true);

      // 调用外部提交回调（如果提供）
      if (onSubmit) {
        await onSubmit(chatInput);
      } else {
        // 默认提交处理
        message.success("提交成功");
        console.log("富文本内容:", chatInput);
        // 这里可以添加提交到后端的逻辑
      }

      // 提交成功后清空输入框
      setChatInput("");
    } catch (error) {
      message.error("提交失败，请重试");
      console.error("提交错误:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="mb-4">
        <h2 className="text-xl font-semibold">Ant Design 富文本编辑器</h2>
      </header>

      <main className="flex-1">
        <form onSubmit={handleFormSubmit} className="h-full flex flex-col">
          <div className="flex-1 mb-4">
            <textarea
              id="richTextInput"
              value={chatInput}
              onChange={handleContentChange}
              placeholder={placeholder}
              className="w-full h-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              style={{ display: "inline-block" }}
              aria-label="富文本编辑器"
              aria-describedby="editor-description"
              disabled={loading}
            />
          </div>

          <div
            id="editor-description"
            className="text-sm text-gray-500 dark:text-gray-400 mb-4"
          >
            支持文本格式化、列表、链接等富文本功能
          </div>

          <footer className="flex justify-between items-center">
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleFormSubmit}
              disabled={!chatInput.trim() || loading}
              htmlType="submit"
              className="flex items-center gap-1"
              loading={loading}
            >
              提交
            </Button>
          </footer>
        </form>
      </main>
    </div>
  );
}
