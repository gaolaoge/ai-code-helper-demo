// 代码组件属性类型定义
interface CodeProps {
  children: string;
  language?: string;
}

/**
 * 代码展示组件
 * 使用 SyntaxHighlighter 展示格式化的代码内容
 */
function Code({ children, language = "javascript" }: CodeProps) {
  return <div className="flex-1 overflow-auto">CODE</div>;
}

export default Code;
