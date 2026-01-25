import { ChatModelAdapter } from '@assistant-ui/react';
import { MLCEngine } from '@mlc-ai/web-llm';
import { Dispatcher } from '../../utils/event';
import { EVENT_THREAD_SET_TITLE } from '../../constants';
import { ChatMessage } from '../../types/assistant';

/**
 * Truncate messages based on maxMessages and maxContextLength
 */
function truncateMessages(
  messages: ChatMessage[],
  maxMessages?: number,
  maxContextLength?: number
): ChatMessage[] {
  let result = [...messages];

  // Truncate by message count (keep the most recent messages)
  if (maxMessages && maxMessages > 0 && result.length > maxMessages) {
    // Always keep the first message if it's a system message
    const firstMessage = result[0];
    const isSystemFirst = firstMessage.role === 'system';

    if (isSystemFirst) {
      result = [firstMessage, ...result.slice(-(maxMessages - 1))];
    } else {
      result = result.slice(-maxMessages);
    }
  }

  // Truncate by total character length
  if (maxContextLength && maxContextLength > 0) {
    const firstMessage = result[0];
    const isSystemFirst = firstMessage.role === 'system';
    const otherMessages = isSystemFirst ? result.slice(1) : result;

    // Calculate length of other messages
    let otherMessagesLength = otherMessages.reduce((sum, msg) => sum + msg.content.length, 0);
    let systemMessageLength = isSystemFirst ? firstMessage.content.length : 0;
    let totalLength = otherMessagesLength + systemMessageLength;

    if (totalLength > maxContextLength) {
      // Reserve 20% of maxContextLength for system message, or at least 500 chars
      const systemMessageReserve = Math.max(500, Math.floor(maxContextLength * 0.2));
      const availableForOther = maxContextLength - systemMessageReserve;

      // Truncate system message if it's too long
      let systemMessage: ChatMessage | null = null;
      if (isSystemFirst) {
        if (firstMessage.content.length > systemMessageReserve) {
          // Keep the beginning of system message (usually contains important instructions)
          systemMessage = {
            ...firstMessage,
            content: firstMessage.content.substring(0, systemMessageReserve) + '...'
          };
        } else {
          systemMessage = firstMessage;
        }
      }

      // Truncate other messages to fit in remaining space
      let truncated = [...otherMessages];
      let currentLength = truncated.reduce((sum, msg) => sum + msg.content.length, 0);
      const systemLength = systemMessage ? systemMessage.content.length : 0;

      // Remove oldest messages until under limit
      while (truncated.length > 0 && (currentLength + systemLength) > maxContextLength) {
        const removed = truncated.shift();
        if (removed) {
          currentLength -= removed.content.length;
        }
      }

      // If still too long, truncate system message further
      if (systemMessage && (currentLength + systemMessage.content.length) > maxContextLength) {
        const maxSystemLength = Math.max(200, maxContextLength - currentLength - 100); // Leave some buffer
        if (systemMessage.content.length > maxSystemLength) {
          systemMessage = {
            ...systemMessage,
            content: systemMessage.content.substring(0, maxSystemLength) + '...'
          };
        }
      }

      result = systemMessage ? [systemMessage, ...truncated] : truncated;
    }
  }

  return result;
}

export const MyModelAdapterStream: (
  llm: MLCEngine,
  onBeforeChat?: (messages: ChatMessage[], llm: MLCEngine) => ChatMessage[] | Promise<ChatMessage[]>,
  maxMessages?: number,
  maxContextLength?: number
) => ChatModelAdapter = (llm, onBeforeChat, maxMessages = 20, maxContextLength = 8000) => ({
  async *run({ messages, abortSignal }) {
    let chatMessages: ChatMessage[] = messages.map(item => ({
      role: item.role as ChatMessage['role'],
      content: (item.content[0] as any).text,
    }))

    // Apply truncation before onBeforeChat hook
    chatMessages = truncateMessages(chatMessages, maxMessages, maxContextLength);

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
