import { ChatModelAdapter } from '@assistant-ui/react';
import { MLCEngine } from '@mlc-ai/web-llm';

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
  },
})