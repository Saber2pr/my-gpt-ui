import { ChatModelAdapter } from '@assistant-ui/react';
import { MLCEngine } from '@mlc-ai/web-llm';
import { Dispatcher } from '@/utils/event';
import { EVENT_THREAD_SET_TITLE } from '@/constants';
import { ChatMessage } from '../../types/assistant';

export const MyModelAdapterStream: (llm: MLCEngine, onBeforeChat?: (messages: ChatMessage[], llm: MLCEngine) => ChatMessage[] | Promise<ChatMessage[]>) => ChatModelAdapter = (llm, onBeforeChat) => ({
  async *run({ messages, abortSignal }) {
    let chatMessages: ChatMessage[] = messages.map(item => ({
      role: item.role as ChatMessage['role'],
      content: (item.content[0] as any).text,
    }))

    if (onBeforeChat) {
      chatMessages = await onBeforeChat(chatMessages, llm)
    }
 
    const chunks = await llm.chat.completions.create({
      messages: chatMessages as any,
      temperature: 1,
      stream: true,
    })

    let reply = "";
    for await (const chunk of chunks) {
      reply += chunk.choices[0]?.delta.content || "";
      yield {
        status: {
          type: 'running',
        },
        content: [
          {
            text: reply,
            type: 'text',
          },
        ],
      }
    }

    yield {
      status: {
        type: 'complete',
        reason: 'stop',
      },
      content: [
        {
          text: reply,
          type: 'text',
        },
      ],
    }

    // 对话完成后，如果这是第一轮对话，生成标题
    if (messages.length === 1) {
      try {
        const summaryResponse = await llm.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a title generation assistant. Please summarize a short title (no more than 10 words) based on the user\'s input, without punctuation.'
            },
            {
              role: 'user',
              content: (messages[0].content[0] as any).text
            }
          ],
          temperature: 0.5,
        });
        
        const title = summaryResponse.choices[0]?.message.content?.trim();
        if (title) {
          Dispatcher.instance.dispatch(EVENT_THREAD_SET_TITLE, { data: title });
        }
      } catch (error) {
        console.error('Failed to generate summary title:', error);
      }
    }
  },
})
