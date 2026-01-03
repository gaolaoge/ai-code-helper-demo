"use client";

import { Avatar } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { useAppContext } from "../../app/providers";

function DialogueRecord() {
  const { messages } = useAppContext();
  console.log("左侧对话记录 messages: ", messages);

  return (
    <div className="h-full overflow-auto">
      {/* 历史对话记录内容区域 */}
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
          <div className="relative mb-6">
            <RobotOutlined className="text-7xl opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
          <div className="text-xl font-medium mb-2">开始你的第一段对话</div>
          <div className="text-sm">输入问题，AI 将为你生成 React 代码</div>
        </div>
      ) : (
        <div className="space-y-6 py-6 px-4">
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const realContent = isUser
              ? message.content
              : message.content.description;
            return (
              <div
                key={index}
                className={`flex items-start gap-4 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* 头像 */}
                <Avatar
                  size={44}
                  icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                  className={`shrink-0 shadow-md ${
                    isUser
                      ? "bg-gradient-to-br from-blue-500 to-blue-600"
                      : "bg-gradient-to-br from-purple-500 to-pink-500"
                  }`}
                />

                {/* 消息内容 */}
                <div
                  className={`flex flex-col max-w-[75%] ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  {/* 用户名和角色 */}
                  <div
                    className={`text-xs font-semibold mb-2 px-1.5 ${
                      isUser
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    {isUser ? "你" : "AI 助手"}
                  </div>

                  {/* 消息气泡 */}
                  <div
                    className={`rounded-2xl px-5 py-3.5 shadow-md transition-shadow hover:shadow-lg ${
                      isUser
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                        : "bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/80 rounded-bl-md backdrop-blur-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">
                      {realContent}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DialogueRecord;
