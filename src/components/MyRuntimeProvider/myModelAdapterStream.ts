import { ChatModelAdapter } from '@assistant-ui/react';
import { MLCEngine } from '@mlc-ai/web-llm';
import { Dispatcher } from '@/utils/event';
import { EVENT_THREAD_SET_TITLE } from '@/constants';

export const MyModelAdapterStream: (llm: MLCEngine) => ChatModelAdapter = llm => ({
  async *run({ messages, abortSignal }) {
 
    const chunks = await llm.chat.completions.create({
      messages: messages.map(item => ({
        role: item.role,
        content: (item.content[0] as any).text,
      })),
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
              content: '你是一个标题生成助手。请根据用户的输入，总结出一个简短的标题（不超过10个字），不要包含标点符号。'
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
