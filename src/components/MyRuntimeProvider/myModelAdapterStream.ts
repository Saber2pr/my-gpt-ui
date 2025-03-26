import { ChatModelAdapter } from '@assistant-ui/react'

export const MyModelAdapterStream: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    let inputText = ''

    // messages 保存了当前对话的上下文，messages[messages.length - 1] 就是最后一次即当前询问的内容
    const inputItem = messages[messages.length - 1].content[0]
    if (inputItem.type === 'text') {
      inputText = inputItem.text
    }

    // 调用私有 api
    const response = await fetch('/api/openapi/v1/app/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream', // 告诉服务器返回流式数据
        'Cache-Control': 'no-cache', // 防止缓存
        Connection: 'keep-alive', // 保持连接
        Authorization: `Bearer ${process.env.GPT_TOKEN}`,
      },
      // 处理参数
      body: JSON.stringify({
        query: inputText,
        stream: true,
      }),
      // 点击取消发送时取消问答
      signal: abortSignal,
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let text = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line)

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue // 过滤无效行

        try {
          const jsonStr = line.replace('data: ', '').trim()
          if (jsonStr === '[DONE]') return

          const jsonData = JSON.parse(jsonStr)

          // 只处理 "answer" 事件，拼接内容
          if (jsonData.event === 'answer') {
            text += jsonData.delta?.content || ''
            yield { content: [{ type: 'text', text }] }
          }
        } catch (e) {
          console.error('JSON 解析错误:', e)
        }
      }
    }
  },
}
