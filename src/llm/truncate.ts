import { ChatMessage } from "../types/assistant";

/**
 * Rough estimation: 1 token ≈ 1.3-1.5 characters for English, 1.5-2 for Chinese
 * Using 1.5 as a conservative estimate
 */
export function estimateTokens(text: string): number {
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
export function truncateMessages(
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

/**
 * Final safety check: aggressive truncation to ensure we're well under the token limit.
 * This is used as a last resort before sending messages to the LLM.
 * It keeps only the most recent messages that fit within the token limit.
 * 
 * @param messages - Messages to truncate
 * @param maxTokens - Maximum token limit (default: 3200)
 * @param maxSystemTokens - Maximum tokens for system message (default: 500)
 * @returns Truncated messages array
 */
export function finalSafetyTruncate(
  messages: ChatMessage[],
  maxTokens: number = 3200,
  maxSystemTokens: number = 500
): ChatMessage[] {
  if (maxTokens <= 0 || messages.length === 0) {
    return messages;
  }

  let totalTokens = messages.reduce((sum, msg) => sum + estimateTokens(msg.content), 0);

  if (totalTokens <= maxTokens) {
    return messages;
  }

  // Aggressive truncation: keep only the most recent messages
  const firstMessage = messages[0];
  const isSystemFirst = firstMessage?.role === 'system';
  const systemMessage = isSystemFirst ? firstMessage : null;
  const otherMessages = isSystemFirst ? messages.slice(1) : messages;

  // Limit system message to maxSystemTokens
  let finalSystemMessage = systemMessage;
  if (systemMessage) {
    const systemTokens = estimateTokens(systemMessage.content);
    if (systemTokens > maxSystemTokens) {
      // Truncate system message to ~maxSystemTokens using binary search
      let low = 0;
      let high = systemMessage.content.length;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const testContent = systemMessage.content.substring(0, mid);
        if (estimateTokens(testContent) <= maxSystemTokens) {
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
  const availableTokens = maxTokens - systemTokens;

  let truncated: ChatMessage[] = [];
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

  return finalSystemMessage ? [finalSystemMessage, ...truncated] : truncated;
}
