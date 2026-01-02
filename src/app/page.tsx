import Chat from "../components/chat"; // 组件被移动到chat子目录
import Build from "../components/build";

export default function Home() {
  return (
    <div className="flex h-full bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black font-sans">
      {/* 左侧聊天区域 */}
      <div className="flex-1 flex flex-col border-r border-zinc-200/80 dark:border-zinc-800/50">
        <div className="px-6 pt-6 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI 代码助手
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            与 AI 对话，生成 React 代码
          </p>
        </div>
        <div className="flex-1 p-6 overflow-hidden">
          <Chat />
        </div>
      </div>

      {/* 右侧构建预览区域 */}
      <div className="flex-1 flex flex-col bg-white/30 dark:bg-zinc-900/30 backdrop-blur-sm">
        <div className="px-6 pt-6 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            代码预览
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            实时预览生成的代码效果
          </p>
        </div>
        <div className="flex-1 p-6 overflow-hidden">
          <Build />
        </div>
      </div>
    </div>
  );
}
