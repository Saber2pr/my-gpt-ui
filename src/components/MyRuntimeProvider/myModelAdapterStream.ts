import { ChatModelAdapter } from '@assistant-ui/react';
import { MLCEngine } from '@mlc-ai/web-llm';
import { Dispatcher } from '../../utils/event';
import { EVENT_THREAD_SET_TITLE } from '../../constants';
import { ChatMessage } from '../../types/assistant';

/**
 * Rough estimation: 1 token ≈ 1.3-1.5 characters for English, 1.5-2 for Chinese
 * Using 1.5 as a conservative estimate
 */
function estimateTokens(text: string): number {
  // Rough estimate: Chinese characters count more, English less
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;
  // Chinese: ~1.8 tokens per char, English: ~1.3 tokens per char
  return Math.ceil(chineseChars * 1.8 + otherChars * 1.3);
}

/**
 * Truncate messages based on maxMessages and maxContextLength
 * Also considers token estimation to avoid exceeding context window
 */
function truncateMessages(
  messages: ChatMessage[],
  maxMessages?: number,
  maxContextLength?: number,
  maxTokens?: number
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

  // Additional token-based truncation as a safety net
  // Default to 3500 tokens (leaving ~600 tokens buffer for 4096 context window)
  const tokenLimit = maxTokens || 3500;
  if (tokenLimit > 0) {
    let totalTokens = result.reduce((sum, msg) => sum + estimateTokens(msg.content), 0);

    if (totalTokens > tokenLimit) {
      const firstMessage = result[0];
      const isSystemFirst = firstMessage.role === 'system';
      const systemMessage = isSystemFirst ? firstMessage : null;
      const otherMessages = isSystemFirst ? result.slice(1) : result;

      // Reserve tokens for system message (max 800 tokens)
      const systemTokens = systemMessage ? Math.min(estimateTokens(systemMessage.content), 800) : 0;
      const availableTokens = tokenLimit - systemTokens;

      // Truncate other messages
      let truncated = [...otherMessages];
      let currentTokens = truncated.reduce((sum, msg) => sum + estimateTokens(msg.content), 0);

      // Remove oldest messages until under token limit
      while (truncated.length > 0 && (currentTokens + systemTokens) > tokenLimit) {
        const removed = truncated.shift();
        if (removed) {
          currentTokens -= estimateTokens(removed.content);
        }
      }

      // Truncate system message if still needed
      let finalSystemMessage = systemMessage;
      if (systemMessage && (currentTokens + systemTokens) > tokenLimit) {
        const maxSystemTokens = Math.max(200, tokenLimit - currentTokens - 100);
        let systemContent = systemMessage.content;
        let systemContentTokens = estimateTokens(systemContent);

        if (systemContentTokens > maxSystemTokens) {
          // Binary search for approximate length
          let low = 0;
          let high = systemContent.length;
          while (low < high) {
            const mid = Math.floor((low + high) / 2);
            const testContent = systemContent.substring(0, mid);
            if (estimateTokens(testContent) <= maxSystemTokens) {
              low = mid + 1;
            } else {
              high = mid;
            }
          }
          systemContent = systemContent.substring(0, Math.max(0, low - 1)) + '...';
        }
        finalSystemMessage = { ...systemMessage, content: systemContent };
      }

      result = finalSystemMessage ? [finalSystemMessage, ...truncated] : truncated;
    }
  }

  return result;
}

export const MyModelAdapterStream: (
  llm: MLCEngine,
  onBeforeChat?: (messages: ChatMessage[], llm: MLCEngine) => ChatMessage[] | Promise<ChatMessage[]>,
  maxMessages?: number,
  maxContextLength?: number,
  maxTokens?: number
) => ChatModelAdapter = (llm, onBeforeChat, maxMessages = 20, maxContextLength = 2500, maxTokens = 3200) => ({
  async *run({ messages, abortSignal }) {
    let chatMessages: ChatMessage[] = messages.map(item => ({
      role: item.role as ChatMessage['role'],
      content: (item.content[0] as any).text,
    }))

    // Apply truncation before onBeforeChat hook
    chatMessages = truncateMessages(chatMessages, maxMessages, maxContextLength, maxTokens);

    if (onBeforeChat) {
      chatMessages = await onBeforeChat(chatMessages, llm)
      // Re-apply truncation after onBeforeChat in case it added more content
      // Use stricter limits to ensure we don't exceed context window
      chatMessages = truncateMessages(chatMessages, maxMessages, maxContextLength, maxTokens);
    }

    // Final safety check: ensure we're well under the token limit
    const finalTokenLimit = maxTokens || 3200; // More conservative default
    if (finalTokenLimit > 0) {
      let totalTokens = chatMessages.reduce((sum, msg) => sum + estimateTokens(msg.content), 0);

      if (totalTokens > finalTokenLimit) {
        // Aggressive truncation: keep only the most recent messages
        const firstMessage = chatMessages[0];
        const isSystemFirst = firstMessage?.role === 'system';
        const systemMessage = isSystemFirst ? firstMessage : null;
        const otherMessages = isSystemFirst ? chatMessages.slice(1) : chatMessages;

        // Limit system message to 500 tokens max
        let finalSystemMessage = systemMessage;
        if (systemMessage) {
          const systemTokens = estimateTokens(systemMessage.content);
          if (systemTokens > 500) {
            // Truncate system message to ~500 tokens
            let low = 0;
            let high = systemMessage.content.length;
            while (low < high) {
              const mid = Math.floor((low + high) / 2);
              const testContent = systemMessage.content.substring(0, mid);
              if (estimateTokens(testContent) <= 500) {
                low = mid + 1;
              } else {
                high = mid;
              }
            }
            finalSystemMessage = {
              ...systemMessage,
              content: systemMessage.content.substring(0, Math.max(0, low - 1)) + '...'
            };
          }
        }

        // Keep only recent messages that fit
        const systemTokens = finalSystemMessage ? estimateTokens(finalSystemMessage.content) : 0;
        const availableTokens = finalTokenLimit - systemTokens;

        let truncated = [];
        let currentTokens = 0;
        // Add messages from newest to oldest until we hit the limit
        for (let i = otherMessages.length - 1; i >= 0; i--) {
          const msg = otherMessages[i];
          const msgTokens = estimateTokens(msg.content);
          if (currentTokens + msgTokens <= availableTokens) {
            truncated.unshift(msg);
            currentTokens += msgTokens;
          } else {
            break;
          }
        }

        chatMessages = finalSystemMessage ? [finalSystemMessage, ...truncated] : truncated;
      }
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
