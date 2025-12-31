import AntdRichTextEditor from "../components/chat"; // 组件被移动到chat子目录
import Build from "../components/build";

export default function Home() {
  return (
    <div className="flex h-full bg-zinc-50 font-sans dark:bg-black">
      <div className="flex-1 p-8 overflow-auto">
        <AntdRichTextEditor />
      </div>
      <div className="flex-1 p-8 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-auto">
        <Build />
      </div>
    </div>
  );
}
