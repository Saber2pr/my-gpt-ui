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
}
