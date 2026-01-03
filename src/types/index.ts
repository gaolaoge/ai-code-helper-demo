export interface AssistantChatMessageType {
  role: "assistant";
  content: { code: string; description: string };
}

export interface UserChatMessageType {
  role: "user";
  content: string;
}

export type ChatMessageType = AssistantChatMessageType | UserChatMessageType;
