import { parseStreamData } from './parseStreamData'
import { ChatModelRunResult } from '@assistant-ui/react'

export async function* streamRequest(
  url: string,
  options: RequestInit,
): AsyncGenerator<ChatModelRunResult> {
  const result = await fetch(url, options)
  const reader = result.body.getReader()

  let currentContent = ''
  let reasonContent = ''
  let chunks = ''

  while (true) {
    try {
      const { done, value } = await reader.read()
      // 流读取完成
      if (done) {
        yield {
          status: {
            type: 'complete',
            reason: 'stop',
          },
          content: [
            {
              text: currentContent,
              type: 'text',
            },
          ],
        }
        break
      }

      // 处理接收到的数据片段
      const text = new TextDecoder().decode(value, { stream: true })

      chunks += text
      const result = parseStreamData(chunks)
      for (const parserRes of result) {
        if (parserRes.event === 'answer') {
          const { content, reasoning_content } = parserRes.data.delta
          currentContent += content || ''
          reasonContent += reasoning_content || ''

          yield {
            status: {
              type: 'running',
            },
            content: [
              {
                text: currentContent,
                type: 'text',
              },
            ],
          }
        }
      }
      chunks = ''
    } catch (error) {
      console.error('Stream reading error:', error)
      if (error?.name === 'AbortError') {
        yield {
          status: {
            type: 'incomplete',
            reason: 'error',
          },
          content: [
            {
              text: reasonContent,
              type: 'reasoning',
            },
          ],
        }
        break
      }
    }
  }
}
