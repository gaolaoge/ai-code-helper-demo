import OpenAI from "openai";

// DeepSeek API 响应类型定义
interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: "system" | "user" | "assistant";
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 消息类型定义
type MessageRole = "system" | "user" | "assistant";

interface Message {
  role: MessageRole;
  content: string;
}

// 消息优化配置
interface MessageOptimizeConfig {
  maxMessages: number; // 最大保留消息数量（不包括 system）
  maxMessageLength: number; // 单条消息最大长度（字符数）
  keepFirstUserMessage: boolean; // 是否保留第一条用户消息
}

/**
 * DeepSeek API 核心组件（服务端版本）
 * 负责与 DeepSeek API 交互，调用其AI能力生成代码或其他内容
 * 维护独立的优化消息队列，用于减少 token 消耗
 */
class DeepSeekCore {
  private static instance: DeepSeekCore | null = null;

  private client: OpenAI;
  private messages: Message[]; // 内部维护的优化消息队列
  private optimizeConfig: MessageOptimizeConfig;

  private constructor() {
    this.messages = [];
    this.client = new OpenAI({
      apiKey: process.env.DEEP_SEEK_API_KEY || "",
      baseURL: "https://api.deepseek.com",
    });
    // 默认优化配置
    this.optimizeConfig = {
      maxMessages: 20, // 最多保留 20 条消息（10 轮对话）
      maxMessageLength: 8000, // 单条消息最多 8000 字符
      keepFirstUserMessage: true, // 保留第一条用户消息以保持上下文
    };
  }

  /**
   * 获取 DeepSeekCore 单例实例
   * 确保整个应用只有一个实例
   */
  static getInstance(): DeepSeekCore {
    if (!DeepSeekCore.instance) {
      DeepSeekCore.instance = new DeepSeekCore();
    }
    return DeepSeekCore.instance;
  }

  /**
   * 添加消息到队列
   * @param userMessage 用户消息
   * @param assistantMessage 助手消息（可选，如果只添加用户消息则后续会自动获取助手回复）
   */
  addMessage(
    userMessage: { role: "user"; content: string },
    assistantMessage?: { role: "assistant"; content: string }
  ): void {
    // 截断过长的消息
    const truncatedUserMessage = this.truncateMessage(userMessage.content);
    this.messages.push({
      role: "user",
      content: truncatedUserMessage,
    });

    if (assistantMessage) {
      const truncatedAssistantMessage = this.truncateMessage(
        assistantMessage.content
      );
      this.messages.push({
        role: "assistant",
        content: truncatedAssistantMessage,
      });
    }

    // 自动优化消息队列
    this.optimizeMessages();
  }

  /**
   * 只添加助手消息到队列（用户消息应该已经在队列中）
   * @param assistantMessage 助手消息
   */
  addAssistantMessage(assistantMessage: {
    role: "assistant";
    content: string;
  }): void {
    const truncatedAssistantMessage = this.truncateMessage(
      assistantMessage.content
    );
    this.messages.push({
      role: "assistant",
      content: truncatedAssistantMessage,
    });

    // 自动优化消息队列
    this.optimizeMessages();
  }

  /**
   * 获取优化后的消息列表（用于 API 调用）
   * @param includeSystem 是否包含 system prompt
   * @param systemPrompt system prompt 内容（如果 includeSystem 为 true）
   */
  getOptimizedMessages(
    includeSystem: boolean = false,
    systemPrompt?: string
  ): Message[] {
    const optimizedMessages = [...this.messages];

    // 如果需要包含 system prompt，添加到开头
    if (includeSystem && systemPrompt) {
      return [
        {
          role: "system",
          content: systemPrompt,
        },
        ...optimizedMessages,
      ];
    }

    return optimizedMessages;
  }

  /**
   * 优化消息队列，减少 token 消耗
   */
  private optimizeMessages(): void {
    const { maxMessages, keepFirstUserMessage } = this.optimizeConfig;

    // 如果消息数量未超过限制，不需要优化
    if (this.messages.length <= maxMessages) {
      return;
    }

    // 如果需要保留第一条用户消息
    if (keepFirstUserMessage && this.messages.length > 0) {
      const firstMessage = this.messages[0];
      const remainingMessages = this.messages.slice(1);

      // 保留第一条消息，然后从剩余的最近消息中选择
      const recentMessages = remainingMessages.slice(
        -maxMessages + 1 // +1 因为要保留第一条
      );

      this.messages = [firstMessage, ...recentMessages];
    } else {
      // 只保留最近的消息
      this.messages = this.messages.slice(-maxMessages);
    }
  }

  /**
   * 截断过长的消息
   */
  private truncateMessage(content: string): string {
    const { maxMessageLength } = this.optimizeConfig;
    if (content.length <= maxMessageLength) {
      return content;
    }
    // 保留前 maxMessageLength 个字符，并添加截断提示
    return (
      content.substring(0, maxMessageLength) + "\n\n[消息过长，已自动截断...]"
    );
  }

  /**
   * DeepSeek API 调用函数
   * @param messages 消息列表（如果提供则使用，否则使用内部维护的队列）
   * @returns 助手回复内容
   */
  async callDeepSeekApi(
    messages?: Message[]
  ): Promise<{ content: string; error?: string }> {
    const messagesToSend = messages || this.messages;

    if (!messagesToSend.length) {
      return { content: "", error: "消息历史为空" };
    }

    try {
      const newMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
        messagesToSend.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = (await this.client.chat.completions.create({
        model: "deepseek-chat",
        messages: newMessages,
      })) as DeepSeekResponse;

      const assistantMessage = response.choices[0].message;
      const content = assistantMessage.content as string;

      return { content };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "未知错误";
      console.error("DeepSeek API 调用失败:", errorMessage);
      return {
        content: "",
        error: `API 调用失败: ${errorMessage}`,
      };
    }
  }

  /**
   * 清空消息历史
   */
  clearMessages(): void {
    this.messages = [];
  }

  /**
   * 设置优化配置
   */
  setOptimizeConfig(config: Partial<MessageOptimizeConfig>): void {
    this.optimizeConfig = { ...this.optimizeConfig, ...config };
  }

  /**
   * 获取当前消息数量
   */
  getMessageCount(): number {
    return this.messages.length;
  }
}

export default DeepSeekCore;
