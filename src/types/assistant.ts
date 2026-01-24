import { LocaleType } from '../i18n/locales'
import { MLCEngine } from '@mlc-ai/web-llm'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIAssistantConfig {
  welcomeMessage?: string
  suggestions?: string[]
  placeholder?: string
  emptyMessage?: string
  locale?: LocaleType
  /**
   * 在发送给 AI 之前拦截并修改对话消息。
   * 可以用于注入 System Prompt、背景知识或过滤历史记录。
   * 
   * @example
   * onBeforeChat: (messages) => {
   *   const systemPrompt = { role: 'system', content: '你是一个翻译助手' };
   *   return [systemPrompt, ...messages];
   * }
   */
  onBeforeChat?: (messages: ChatMessage[], llm: MLCEngine) => ChatMessage[] | Promise<ChatMessage[]>
}
