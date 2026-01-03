import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { DeepSeekCore } from "@/core";

// 缓存 systemPrompt（避免每次请求都读取文件）
let cachedSystemPrompt: string | null = null;

/**
 * 读取系统提示（带缓存）
 */
function getSystemPrompt(): string {
  // 如果已缓存，直接返回
  if (cachedSystemPrompt) {
    return cachedSystemPrompt;
  }

  try {
    const systemPromptPath = join(
      process.cwd(),
      "public",
      "prompts",
      "system.md"
    );
    cachedSystemPrompt = readFileSync(systemPromptPath, "utf-8");
    return cachedSystemPrompt;
  } catch (error) {
    console.error("读取系统提示失败:", error);
    cachedSystemPrompt = "你是一个资深前端专家，专注于将设计转换为高质量代码。";
    return cachedSystemPrompt;
  }
}

/**
 * POST /api/chat
 * 处理聊天请求，调用 DeepSeek API
 * 使用 DeepSeekCore 内部维护的优化消息队列
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, includeSystem, clearHistory } = body;

    // 获取 DeepSeekCore 实例
    const deepSeekCore = DeepSeekCore.getInstance();

    // 如果请求清空历史，先清空
    if (clearHistory) {
      deepSeekCore.clearMessages();
    }

    // 验证用户消息
    if (!userMessage || typeof userMessage.content !== "string") {
      return NextResponse.json({ error: "用户消息无效" }, { status: 400 });
    }

    // 判断是否为第一次消息（需要包含 systemPrompt）
    const isFirstMessage =
      includeSystem || deepSeekCore.getMessageCount() === 0;
    const systemPrompt = isFirstMessage ? getSystemPrompt() : undefined;

    // 添加用户消息到 DeepSeekCore 的队列
    deepSeekCore.addMessage({
      role: "user",
      content: userMessage.content,
    });

    // 获取优化后的消息列表（用于 API 调用）
    const optimizedMessages = deepSeekCore.getOptimizedMessages(
      isFirstMessage,
      systemPrompt
    );

    // 调用 DeepSeek API
    const result = await deepSeekCore.callDeepSeekApi(optimizedMessages);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // 解析 DeepSeek 返回的 JSON 字符串为对象
    let parsedContent: { code: string; description: string };
    try {
      parsedContent = JSON.parse(result.content);

      // 验证解析后的对象结构
      if (
        !parsedContent ||
        typeof parsedContent.code !== "string" ||
        typeof parsedContent.description !== "string"
      ) {
        throw new Error("返回的 JSON 结构不符合预期");
      }
    } catch (parseError) {
      console.error("解析 DeepSeek 返回的 JSON 失败:", parseError);
      console.error("原始内容:", result.content);
      return NextResponse.json(
        {
          error: "AI 返回的内容格式不正确，无法解析为 JSON 对象",
        },
        { status: 500 }
      );
    }

    // 将助手回复添加到消息队列（保存原始字符串，因为 API 需要字符串格式）
    deepSeekCore.addAssistantMessage({
      role: "assistant",
      content: result.content,
    });

    // 返回解析后的对象结构
    return NextResponse.json({
      content: parsedContent,
    });
  } catch (error) {
    console.error("API 路由错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
