import { LocaleType } from '../i18n/locales'
import { MLCEngine } from '@mlc-ai/web-llm'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIAssistantConfig {
  /**
   * The welcome message displayed at the top of the chat.
   */
  welcomeMessage?: string
  /**
   * A list of suggested questions to show when the chat is empty.
   */
  suggestions?: string[]
  /**
   * The placeholder text for the message input box.
   */
  placeholder?: string
  /**
   * The message displayed when the thread list is empty.
   */
  emptyMessage?: string
  /**
   * The language locale for the UI.
   * @default 'zh-CN'
   */
  locale?: LocaleType
  /**
   * The ID of the container element where the assistant will be mounted.
   * @default 'ai-assistant-root'
   */
  containerId?: string
  /**
   * The initial coordinates of the floating button.
   * @default { x: window.innerWidth - 100, y: window.innerHeight - 100 }
   */
  initialPosition?: { x: number; y: number }
  /**
   * The theme for the UI.
   * @default 'light'
   */
  theme?: 'light' | 'dark' | (() => 'light' | 'dark')
  /**
   * A hook to intercept and modify conversation messages before they are sent to the AI.
   * Useful for injecting system prompts, background knowledge, or filtering history.
   * 
   * @example
   * onBeforeChat: (messages) => {
   *   const systemPrompt = { role: 'system', content: 'You are a translation assistant' };
   *   return [systemPrompt, ...messages];
   * }
   */
  onBeforeChat?: (messages: ChatMessage[], llm: MLCEngine) => ChatMessage[] | Promise<ChatMessage[]>
  /**
   * Maximum number of messages to keep in context. Older messages will be truncated.
   * Set to 0 or undefined to disable truncation.
   * @default 20
   */
  maxMessages?: number
  /**
   * Maximum total characters in the context. Messages will be truncated from the oldest if exceeded.
   * Note: This is a rough estimate. Actual token count may vary. For models with 4096 context window,
   * a safe value is around 2500-3000 characters.
   * Set to 0 or undefined to disable truncation.
   * @default 2500
   */
  maxContextLength?: number
  /**
   * Maximum estimated tokens in the context. This is a safety net to prevent exceeding model's context window.
   * For models with 4096 context window, a safe value is around 3200 tokens (leaving ~900 tokens buffer for response and overhead).
   * Set to 0 or undefined to disable token-based truncation.
   * @default 3200
   */
  maxTokens?: number
}
