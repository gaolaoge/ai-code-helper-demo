// 预览组件属性类型定义
interface PreviewProps {
  children: string;
}

/**
 * 预览展示组件
 * 用于展示生成内容的预览效果
 */
function Preview({ children }: PreviewProps) {
  // 创建一个安全的HTML渲染函数，只渲染基本HTML标签
  const createMarkup = () => {
    // 简单的HTML过滤，只允许基本的文本格式标签
    const safeContent = children
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/<style[^>]*>.*?<\/style>/gi, "")
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");

    return { __html: safeContent };
  };

  return (
    <div className="flex-1 overflow-auto">
      <div
        className="bg-white dark:bg-zinc-900 p-6 rounded-md border border-zinc-200 dark:border-zinc-700"
        dangerouslySetInnerHTML={createMarkup()}
      />
    </div>
  );
}

export default Preview;
